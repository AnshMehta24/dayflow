"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import type { LeaveRequest, LeaveType, LeaveStatus } from "@/types/leave";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

const applyLeaveSchema = z.object({
  leaveType: z.enum(["PAID", "SICK", "UNPAID", "EXTRA"]),
  startDate: z.date(),
  endDate: z.date(),
  remarks: z.string().optional(),
});

const approveLeaveSchema = z.object({
  leaveRequestId: z.string(),
  adminComment: z.string().optional(),
});

const rejectLeaveSchema = z.object({
  leaveRequestId: z.string(),
  adminComment: z.string().min(1, "Admin comment is required for rejection"),
});

// Helper function to check for overlapping leave requests
async function hasOverlappingLeave(
  userId: string,
  startDate: Date,
  endDate: Date,
  excludeId?: string
): Promise<boolean> {
  const overlapping = await prisma.leaveRequest.findFirst({
    where: {
      userId,
      id: excludeId ? { not: excludeId } : undefined,
      status: {
        in: ["PENDING", "APPROVED"],
      },
      OR: [
        // New leave starts during existing leave
        {
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      ],
    },
  });

  return !!overlapping;
}

// Helper function to transform Prisma LeaveRequest to API format
function transformLeaveRequest(
  leave: {
    id: string;
    userId: string;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    remarks: string | null;
    status: string;
    adminComment: string | null;
    createdAt: Date;
    updatedAt: Date;
    user?: {
      name: string;
    } | null;
  }
): LeaveRequest {
  return {
    id: leave.id,
    userId: leave.userId,
    employeeName: leave.user?.name,
    leaveType: leave.leaveType as LeaveType,
    startDate: leave.startDate.toISOString().split("T")[0],
    endDate: leave.endDate.toISOString().split("T")[0],
    remarks: leave.remarks,
    status: leave.status as LeaveStatus,
    adminComment: leave.adminComment,
    createdAt: leave.createdAt.toISOString(),
    updatedAt: leave.updatedAt.toISOString(),
  };
}

/**
 * Apply for Leave (EMPLOYEE only)
 */
export async function applyLeave(input: {
  leaveType: LeaveType;
  startDate: Date | string;
  endDate: Date | string;
  remarks?: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
      statusCode: 401,
    };
  }

  try {
    // Get user to check role and company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, companyId: true },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        statusCode: 404,
      };
    }

    // Only EMPLOYEE can apply for leave
    if (user.role !== "EMPLOYEE") {
      return {
        success: false,
        error: "Forbidden: Only employees can apply for leave",
        statusCode: 403,
      };
    }

    // Parse dates if strings
    const startDate = typeof input.startDate === "string" 
      ? new Date(input.startDate) 
      : input.startDate;
    const endDate = typeof input.endDate === "string" 
      ? new Date(input.endDate) 
      : input.endDate;

    // Validate input with Zod
    const validation = applyLeaveSchema.safeParse({
      leaveType: input.leaveType,
      startDate,
      endDate,
      remarks: input.remarks,
    });

    if (!validation.success) {
      return {
        success: false,
        error: "Validation error: " + validation.error.issues.map((e) => e.message).join(", "),
        statusCode: 400,
      };
    }

    const { leaveType, startDate: validatedStartDate, endDate: validatedEndDate, remarks } = validation.data;

    // Normalize dates to start of day
    const start = new Date(validatedStartDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(validatedEndDate);
    end.setHours(0, 0, 0, 0);

    // Validation: startDate <= endDate
    if (start > end) {
      return {
        success: false,
        error: "Start date must be before or equal to end date",
        statusCode: 400,
      };
    }

    // Validation: startDate >= today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      return {
        success: false,
        error: "Start date must be today or in the future",
        statusCode: 400,
      };
    }

    // Check for overlapping leave requests
    const hasOverlap = await hasOverlappingLeave(session.user.id, start, end);
    if (hasOverlap) {
      return {
        success: false,
        error: "You already have an approved or pending leave request for this date range",
        statusCode: 409,
      };
    }

    // Calculate number of days requested
    const daysRequested = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Check balance for PAID and SICK leave types
    if (leaveType === "PAID" || leaveType === "SICK") {
      // Get current balance from ledger
      const balanceResult = await getLeaveBalance(session.user.id, leaveType);
      
      if (!balanceResult.success) {
        return {
          success: false,
          error: "Failed to check leave balance. Please try again.",
          statusCode: 500,
        };
      }

      const currentBalance = balanceResult.data as number;

      // Get pending leave requests for the same leave type to calculate reserved balance
      const pendingLeaves = await prisma.leaveRequest.findMany({
        where: {
          userId: session.user.id,
          leaveType,
          status: "PENDING",
        },
      });

      // Calculate reserved days from pending requests
      let reservedDays = 0;
      pendingLeaves.forEach((pendingLeave) => {
        const pendingStart = new Date(pendingLeave.startDate);
        const pendingEnd = new Date(pendingLeave.endDate);
        const pendingDays = Math.ceil((pendingEnd.getTime() - pendingStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        reservedDays += pendingDays;
      });

      // Available balance = current balance - reserved days
      const availableBalance = currentBalance - reservedDays;

      // Check if employee has sufficient balance
      if (availableBalance < daysRequested) {
        const leaveTypeName = leaveType === "PAID" ? "Paid Time Off" : "Sick Leave";
        return {
          success: false,
          error: `Insufficient ${leaveTypeName} balance. You have ${availableBalance} day(s) available (${currentBalance} total, ${reservedDays} pending), but you requested ${daysRequested} day(s). Please consider applying for Unpaid Leave instead.`,
          statusCode: 400,
          data: {
            availableBalance,
            requestedDays: daysRequested,
            currentBalance,
            reservedDays,
            suggestedLeaveType: "UNPAID",
          },
        };
      }
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId: session.user.id,
        companyId: user.companyId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        leaveType: leaveType as any, // Type assertion needed until Prisma Client is regenerated
        startDate: start,
        endDate: end,
        remarks: remarks || null,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      data: transformLeaveRequest(leaveRequest),
      message: "Leave request submitted successfully",
    };
  } catch (error) {
    console.error("Error applying for leave:", error);
    return {
      success: false,
      error: "Failed to submit leave request",
      statusCode: 500,
    };
  }
}

export async function getLeaveRequests() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
      statusCode: 401,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, companyId: true },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        statusCode: 404,
      };
    }

    const where: Prisma.LeaveRequestWhereInput = {};

    if (user.role === "EMPLOYEE") {
      where.userId = session.user.id;
    } else if (user.role === "HR") {
      where.companyId = user.companyId;
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        user: user.role === "HR"
          ? {
              select: {
                id: true,
                name: true,
                email: true,
                loginId: true,
              },
            }
          : false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformed: LeaveRequest[] = leaveRequests.map(transformLeaveRequest);

    return {
      success: true,
      data: transformed,
    };
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return {
      success: false,
      error: "Failed to fetch leave requests",
      statusCode: 500,
    };
  }
}

export async function approveLeave(input: {
  leaveRequestId: string;
  adminComment?: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
      statusCode: 401,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        statusCode: 404,
      };
    }

    if (user.role !== "HR") {
      return {
        success: false,
        error: "Forbidden: Only HR can approve leave requests",
        statusCode: 403,
      };
    }

    const validation = approveLeaveSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: "Validation error: " + validation.error.issues.map((e) => e.message).join(", "),
        statusCode: 400,
      };
    }

    const { leaveRequestId, adminComment } = validation.data;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      return {
        success: false,
        error: "Leave request not found",
        statusCode: 404,
      };
    }

    if (leaveRequest.status !== "PENDING") {
      return {
        success: false,
        error: `Leave request is already ${leaveRequest.status.toLowerCase()}`,
        statusCode: 409,
      };
    }

    const start = new Date(leaveRequest.startDate);
    const end = new Date(leaveRequest.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const [updated] = await prisma.$transaction([
      prisma.leaveRequest.update({
        where: { id: leaveRequestId },
        data: {
          status: "APPROVED",
          adminComment: adminComment || null,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.leaveLedger.create({
        data: {
          userId: leaveRequest.userId,
          companyId: leaveRequest.companyId,
          leaveType: leaveRequest.leaveType,
          change: -days,
          reason: "LEAVE_APPROVED",
          referenceId: leaveRequestId,
        },
      }),
    ]);

    return {
      success: true,
      data: transformLeaveRequest(updated),
      message: "Leave request approved successfully",
    };
  } catch (error) {
    console.error("Error approving leave:", error);
    
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return {
        success: false,
        error: "Leave request not found",
        statusCode: 404,
      };
    }

    return {
      success: false,
      error: "Failed to approve leave request",
      statusCode: 500,
    };
  }
}

export async function rejectLeave(input: {
  leaveRequestId: string;
  adminComment: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
      statusCode: 401,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        statusCode: 404,
      };
    }

    if (user.role !== "HR") {
      return {
        success: false,
        error: "Forbidden: Only HR can reject leave requests",
        statusCode: 403,
      };
    }

    const validation = rejectLeaveSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: "Validation error: " + validation.error.issues.map((e) => e.message).join(", "),
        statusCode: 400,
      };
    }

    const { leaveRequestId, adminComment } = validation.data;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      return {
        success: false,
        error: "Leave request not found",
        statusCode: 404,
      };
    }

    if (leaveRequest.status !== "PENDING") {
      return {
        success: false,
        error: `Leave request is already ${leaveRequest.status.toLowerCase()}`,
        statusCode: 409,
      };
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: "REJECTED",
        adminComment: adminComment,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      data: transformLeaveRequest(updated),
      message: "Leave request rejected successfully",
    };
  } catch (error) {
    console.error("Error rejecting leave:", error);
    
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return {
        success: false,
        error: "Leave request not found",
        statusCode: 404,
      };
    }

    return {
      success: false,
      error: "Failed to reject leave request",
      statusCode: 500,
    };
  }
}

export async function getLeaveLedgers(userId?: string, leaveType?: LeaveType) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
      statusCode: 401,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, companyId: true },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        statusCode: 404,
      };
    }

    if (user.role !== "HR") {
      return {
        success: false,
        error: "Forbidden: Only HR can view leave ledger",
        statusCode: 403,
      };
    }

    const where: Prisma.LeaveLedgerWhereInput = {
      companyId: user.companyId,
    };

    if (userId) {
      where.userId = userId;
    }

    if (leaveType && leaveType !== "UNPAID") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where.leaveType = leaveType as any; // Type assertion needed until Prisma Client is regenerated
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where.leaveType = { notIn: ["UNPAID"] as any };
    }

    const ledgerEntries = await prisma.leaveLedger.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            loginId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: ledgerEntries,
    };
  } catch (error) {
    console.error("Error fetching leave ledger:", error);
    return {
      success: false,
      error: "Failed to fetch leave ledger",
      statusCode: 500,
    };
  }
}


export async function getLeaveBalance(userId: string, leaveType?: LeaveType) {
  try {
    if (leaveType === "UNPAID") {
      return {
        success: true,
        data: 0,
      };
    }

    const where: Prisma.LeaveLedgerWhereInput = {
      userId,
    };

    if (leaveType) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where.leaveType = leaveType as any; // Type assertion needed until Prisma Client is regenerated
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where.leaveType = { notIn: ["UNPAID"] as any };
    }

    const ledgerEntries = await prisma.leaveLedger.findMany({
      where,
      select: {
        leaveType: true,
        change: true,
      },
    });

    const balance: Record<"PAID" | "SICK" | "EXTRA", number> = {
      PAID: 0,
      SICK: 0,
      EXTRA: 0,
    };

    ledgerEntries.forEach((entry: { leaveType: LeaveType; change: number }) => {
      const type = entry.leaveType as "PAID" | "SICK" | "EXTRA";
      if (type in balance) {
        balance[type] += entry.change;
      }
    });

    if (leaveType && (leaveType === "PAID" || leaveType === "SICK" || leaveType === "EXTRA")) {
      return {
        success: true,
        data: balance[leaveType],
      };
    }

    return {
      success: true,
      data: balance,
    };
  } catch (error) {
    console.error("Error calculating leave balance:", error);
    return {
      success: false,
      error: "Failed to calculate leave balance",
      statusCode: 500,
    };
  }
}

export async function getEmployees() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
      statusCode: 401,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, companyId: true },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        statusCode: 404,
      };
    }

    if (user.role !== "HR") {
      return {
        success: false,
        error: "Forbidden: Only HR can view employees",
        statusCode: 403,
      };
    }

    const employees = await prisma.user.findMany({
      where: {
        companyId: user.companyId,
        role: "EMPLOYEE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        loginId: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: employees,
    };
  } catch (error) {
    console.error("Error fetching employees:", error);
    return {
      success: false,
      error: "Failed to fetch employees",
      statusCode: 500,
    };
  }
}

const addLeaveLedgerEntrySchema = z.object({
  userIds: z.array(z.string()).min(1, "At least one employee must be selected"),
  leaveType: z.enum(["PAID", "SICK", "EXTRA"]), // UNPAID cannot be allocated via ledger
  change: z.number().int(),
  reason: z.enum(["ACCRUAL", "LEAVE_APPROVED", "MANUAL_ADJUSTMENT"]),
  referenceId: z.string().optional(),
});

export async function addLeaveLedgerEntry(input: {
  userIds: string[];
  leaveType: LeaveType;
  change: number;
  reason: "ACCRUAL" | "LEAVE_APPROVED" | "MANUAL_ADJUSTMENT";
  referenceId?: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
      statusCode: 401,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, companyId: true },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        statusCode: 404,
      };
    }

    if (user.role !== "HR") {
      return {
        success: false,
        error: "Forbidden: Only HR can add leave ledger entries",
        statusCode: 403,
      };
    }

    const validation = addLeaveLedgerEntrySchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: "Validation error: " + validation.error.issues.map((e) => e.message).join(", "),
        statusCode: 400,
      };
    }

    const { userIds, leaveType, change, reason, referenceId } = validation.data;

    const employees = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        companyId: user.companyId,
        role: "EMPLOYEE",
      },
      select: { id: true },
    });

    if (employees.length !== userIds.length) {
      return {
        success: false,
        error: "Some selected employees are invalid or don't belong to your company",
        statusCode: 400,
      };
    }

    const ledgerEntries = await Promise.all(
      userIds.map((userId) =>
        prisma.leaveLedger.create({
          data: {
            userId,
            companyId: user.companyId,
            leaveType,
            change,
            reason,
            referenceId: referenceId || null,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                loginId: true,
              },
            },
          },
        })
      )
    );

    const reasonText =
      reason === "ACCRUAL"
        ? "accrued"
        : reason === "MANUAL_ADJUSTMENT"
        ? "manually adjusted"
        : "deducted";

    return {
      success: true,
      data: ledgerEntries,
      message: `${change > 0 ? "+" : ""}${change} day(s) ${reasonText} for ${userIds.length} employee(s)`,
    };
  } catch (error) {
    console.error("Error adding leave ledger entry:", error);
    return {
      success: false,
      error: "Failed to add leave ledger entry",
      statusCode: 500,
    };
  }
}

export async function getEmployeeLeaveBalance(userId?: string, leaveType?: LeaveType) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
      statusCode: 401,
    };
  }

  const targetUserId = userId || session.user.id;

  try {
    if (leaveType === "UNPAID") {
      const pendingUnpaidLeaves = await prisma.leaveRequest.findMany({
        where: {
          userId: targetUserId,
          status: "PENDING",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          leaveType: "UNPAID" as any, // Type assertion needed until Prisma Client is regenerated
        },
      });

      let reserved = 0;
      pendingUnpaidLeaves.forEach((pendingLeave) => {
        const pendingStart = new Date(pendingLeave.startDate);
        const pendingEnd = new Date(pendingLeave.endDate);
        const pendingDays = Math.ceil((pendingEnd.getTime() - pendingStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        reserved += pendingDays;
      });

      return {
        success: true,
        data: {
          leaveType: "UNPAID",
          balance: 0, // UNPAID is not tracked
          availableBalance: 0, // UNPAID is not tracked
          reserved,
        },
      };
    }

    const balanceResult = await getLeaveBalance(targetUserId, leaveType);

    if (!balanceResult.success) {
      return balanceResult;
    }

    const pendingLeavesWhere: Prisma.LeaveRequestWhereInput = {
      userId: targetUserId,
      status: "PENDING",
    };
    
    if (leaveType && (leaveType === "PAID" || leaveType === "SICK" || leaveType === "EXTRA")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pendingLeavesWhere.leaveType = leaveType as any; // Type assertion needed until Prisma Client is regenerated
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pendingLeavesWhere.leaveType = { notIn: ["UNPAID"] as any };
    }
    
    const pendingLeaves = await prisma.leaveRequest.findMany({
      where: pendingLeavesWhere,
    });

    const reservedDays: Record<"PAID" | "SICK" | "EXTRA", number> = {
      PAID: 0,
      SICK: 0,
      EXTRA: 0,
    };

    pendingLeaves.forEach((pendingLeave) => {
      const type = pendingLeave.leaveType as "PAID" | "SICK" | "EXTRA";
      if (type in reservedDays) {
        const pendingStart = new Date(pendingLeave.startDate);
        const pendingEnd = new Date(pendingLeave.endDate);
        const pendingDays = Math.ceil((pendingEnd.getTime() - pendingStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        reservedDays[type] += pendingDays;
      }
    });

    const balance = balanceResult.data;

    if (leaveType && (leaveType === "PAID" || leaveType === "SICK" || leaveType === "EXTRA")) {
      const currentBalance = balance as number;
      const reserved = reservedDays[leaveType];
      return {
        success: true,
        data: {
          leaveType,
          balance: currentBalance,
          availableBalance: currentBalance - reserved,
          reserved,
        },
      };
    }

    const allBalances = balance as Record<"PAID" | "SICK" | "EXTRA", number>;
    return {
      success: true,
      data: (["PAID", "SICK", "EXTRA"] as const).map((type) => ({
        leaveType: type,
        balance: allBalances[type] || 0,
        availableBalance: (allBalances[type] || 0) - reservedDays[type],
        reserved: reservedDays[type],
      })),
    };
  } catch (error) {
    console.error("Error fetching leave balance:", error);
    return {
      success: false,
      error: "Failed to fetch leave balance",
      statusCode: 500,
    };
  }
}

