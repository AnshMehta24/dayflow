"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import type { AttendanceRecord, AttendanceSummary } from "@/types/attendance";
import type { Prisma } from "@prisma/client";

function formatTime(date: Date | null): string | null {
  if (!date) return null;
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function transformEntryToRecord(
  entry: {
    id: string;
    checkIn: Date;
    checkOut: Date | null;
    duration: number | null;
  },
  attendance: {
    date: Date;
    totalHours: number | null;
  },
  employeeName?: string,
  totalHoursPerDay?: number
): AttendanceRecord {
  const checkIn = formatTime(entry.checkIn);
  const checkOut = formatTime(entry.checkOut);
  
  const workHours = entry.duration || (entry.checkOut 
    ? (entry.checkOut.getTime() - entry.checkIn.getTime()) / (1000 * 60 * 60)
    : 0);
  
  const totalHours = totalHoursPerDay ?? attendance.totalHours ?? 0;
  
  return {
    id: entry.id,
    employeeName,
    date: attendance.date.toISOString().split("T")[0],
    checkIn,
    checkOut,
    workHours,
    totalHours,
  };
}

function transformAttendanceToRecord(
  attendance: {
    id: string;
    date: Date;
    totalHours: number | null;
    entries: Array<{
      checkIn: Date;
      checkOut: Date | null;
    }>;
    user?: {
      name: string;
    } | null;
  },
  employeeName?: string
): AttendanceRecord {
  const firstEntry = attendance.entries?.[0];
  const lastEntry = attendance.entries?.[attendance.entries.length - 1];
  
  const checkIn = firstEntry?.checkIn ? formatTime(firstEntry.checkIn) : null;
  const checkOut = lastEntry?.checkOut ? formatTime(lastEntry.checkOut) : null;
  
  const totalHours = attendance.totalHours || 0;
  const workHours = totalHours;
  
  const finalEmployeeName = employeeName || attendance.user?.name;
  
  return {
    id: attendance.id,
    employeeName: finalEmployeeName,
    date: attendance.date.toISOString().split("T")[0],
    checkIn,
    checkOut,
    workHours,
    totalHours,
  };
}

export async function getAttendance(params?: {
  from?: Date;
  to?: Date;
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

    let userId: string | undefined;
    if (user.role === "EMPLOYEE") {
      userId = session.user.id;
    }

    const where: Prisma.AttendanceWhereInput = {};
    
    if (userId) {
      where.userId = userId;
    } else if (user.role === "HR") {
      where.companyId = user.companyId;
    }

    if (params?.from || params?.to) {
      where.date = {};
      if (params.from) {
        where.date.gte = params.from;
      }
      if (params.to) {
        where.date.lte = params.to;
      }
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        user: user.role === "HR" ? {
          select: {
            id: true,
            name: true,
            email: true,
            loginId: true,
          },
        } : false,
        entries: {
          orderBy: { checkIn: "asc" },
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
            duration: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const records: AttendanceRecord[] = attendances.flatMap((attendance) => {
      const totalHoursPerDay = attendance.totalHours ?? 
        attendance.entries.reduce((sum, entry) => {
          const duration = entry.duration ?? (entry.checkOut
            ? (entry.checkOut.getTime() - entry.checkIn.getTime()) / (1000 * 60 * 60)
            : 0);
          return sum + duration;
        }, 0);

      return attendance.entries.map((entry) =>
        transformEntryToRecord(
          entry,
          attendance,
          user.role === "HR" ? attendance.user?.name : undefined,
          totalHoursPerDay
        )
      );
    });

    records.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      if (b.checkIn && a.checkIn) {
        return b.checkIn.localeCompare(a.checkIn);
      }
      return 0;
    });

    return {
      success: true,
      data: records,
    };
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return {
      success: false,
      error: "Failed to fetch attendance records",
      statusCode: 500,
    };
  }
}

export async function getMyAttendance(month: string) {
  const session = await getServerSession(authOptions);

  const id = session?.user?.id;
  if (!id) {
    return {
      success: false,
      error: "Unauthorized",
      statusCode: 401,
    };
  }

  try {
    const [year, monthNum] = month.split("-");
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        userId: id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        entries: {
          orderBy: { checkIn: "asc" },
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
            duration: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const records: AttendanceRecord[] = attendances.flatMap((attendance) => {
      const totalHoursPerDay = attendance.totalHours ?? 
        attendance.entries.reduce((sum, entry) => {
          const duration = entry.duration ?? (entry.checkOut
            ? (entry.checkOut.getTime() - entry.checkIn.getTime()) / (1000 * 60 * 60)
            : 0);
          return sum + duration;
        }, 0);

      return attendance.entries.map((entry) =>
        transformEntryToRecord(entry, attendance, undefined, totalHoursPerDay)
      );
    });

    records.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      if (b.checkIn && a.checkIn) {
        return b.checkIn.localeCompare(a.checkIn);
      }
      return 0;
    });

    return {
      success: true,
      data: records,
    };
  } catch (error) {
    console.error("Error fetching my attendance:", error);
    return {
      success: false,
      error: "Failed to fetch attendance records",
      statusCode: 500,
    };
  }
}

export async function getAllEmployeesAttendance(date: string) {
  const session = await getServerSession(authOptions);
  const id = session?.user?.id;

  if (!id) {
    return {
      success: false,
      error: "Unauthorized",
      statusCode: 401,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, companyId: true },
  });

  if (!user || user.role !== "HR") {
    return {
      success: false,
      error: "Unauthorized: Only HR can view all employees' attendance",
      statusCode: 403,
    };
  }

  try {
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        companyId: user.companyId,
        date: selectedDate,
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
        entries: {
          orderBy: { checkIn: "asc" },
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
            duration: true,
          },
        },
      },
      orderBy: { user: { name: "asc" } },
    });

    const records: AttendanceRecord[] = attendances.flatMap((attendance) => {
      const totalHoursPerDay = attendance.totalHours ?? 
        attendance.entries.reduce((sum, entry) => {
          const duration = entry.duration ?? (entry.checkOut
            ? (entry.checkOut.getTime() - entry.checkIn.getTime()) / (1000 * 60 * 60)
            : 0);
          return sum + duration;
        }, 0);

      return attendance.entries.map((entry) =>
        transformEntryToRecord(entry, attendance, attendance.user?.name, totalHoursPerDay)
      );
    });

    records.sort((a, b) => {
      const nameCompare = (a.employeeName || "").localeCompare(b.employeeName || "");
      if (nameCompare !== 0) return nameCompare;
      if (a.checkIn && b.checkIn) {
        return a.checkIn.localeCompare(b.checkIn);
      }
      return 0;
    });

    return {
      success: true,
      data: records,
    };
  } catch (error) {
    console.error("Error fetching all employees attendance:", error);
    return {
      success: false,
      error: "Failed to fetch attendance records",
      statusCode: 500,
    };
  }
}

export async function getAttendanceSummary(userId: string, month: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
      statusCode: 401,
    };
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, id: true },
  });

  if (!currentUser) {
    return {
      success: false,
      error: "User not found",
      statusCode: 404,
    };
  }

  if (currentUser.role !== "HR" && userId !== session.user.id) {
    return {
      success: false,
      error: "Unauthorized: Cannot view other users' summary",
      statusCode: 403,
    };
  }

  try {
    const [year, monthNum] = month.split("-");
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        userId: userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const summary: AttendanceSummary = {
      totalDays: attendances.length,
      present: attendances.filter((a) => a.status === "PRESENT").length,
      absent: attendances.filter((a) => a.status === "ABSENT").length,
      halfDay: attendances.filter((a) => a.status === "HALF_DAY").length,
      leave: attendances.filter((a) => a.status === "LEAVE").length,
      totalHours: attendances.reduce((sum, a) => sum + (a.totalHours || 0), 0),
    };

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    return {
      success: false,
      error: "Failed to fetch attendance summary",
      statusCode: 500,
    };
  }
}

export async function checkIn(location?: string, notes?: string) {
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      include: {
        entries: {
          where: {
            checkOut: null,
          },
        },
      },
    });

    if (existingAttendance && existingAttendance.entries.length > 0) {
      return {
        success: false,
        error: "Already checked in today",
        statusCode: 409,
      };
    }

    let attendance = existingAttendance;
    if (!attendance) {
      const newAttendance = await prisma.attendance.create({
        data: {
          userId: session.user.id,
          companyId: user.companyId,
          date: today,
          status: "PRESENT",
        },
        include: {
          entries: true,
        },
      });
      attendance = newAttendance;
    }

    const entry = await prisma.attendanceEntry.create({
      data: {
        attendanceId: attendance.id,
        userId: session.user.id,
        companyId: user.companyId,
        checkIn: new Date(),
        location,
        notes,
      },
    });

    return {
      success: true,
      data: entry,
      message: "Checked in successfully",
    };
  } catch (error) {
    console.error("Error during check-in:", error);
    
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return {
        success: false,
        error: "Already checked in today",
        statusCode: 409,
      };
    }

    return {
      success: false,
      error: "Failed to check in",
      statusCode: 500,
    };
  }
}

export async function checkOut(notes?: string) {
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
    });

    if (!attendance) {
      return {
        success: false,
        error: "No check-in found for today",
        statusCode: 400,
      };
    }

    const openEntry = await prisma.attendanceEntry.findFirst({
      where: {
        attendanceId: attendance.id,
        checkOut: null,
      },
      orderBy: { checkIn: "desc" },
    });

    if (!openEntry) {
      return {
        success: false,
        error: "No open check-in found. You must check in before checking out.",
        statusCode: 400,
      };
    }

    const checkOutTime = new Date();
    const duration =
      (checkOutTime.getTime() - openEntry.checkIn.getTime()) / (1000 * 60 * 60);

    const updatedEntry = await prisma.attendanceEntry.update({
      where: { id: openEntry.id },
      data: {
        checkOut: checkOutTime,
        duration: duration,
        notes: notes || openEntry.notes,
      },
    });

    const allEntries = await prisma.attendanceEntry.findMany({
      where: { attendanceId: attendance.id },
    });

    const totalHours = allEntries.reduce(
      (sum, entry) => sum + (entry.duration || 0),
      0
    );

    const halfDayThreshold = 4;
    const status = totalHours < halfDayThreshold ? "HALF_DAY" : "PRESENT";

    await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        totalHours: totalHours,
        status: status,
      },
    });

    return {
      success: true,
      data: updatedEntry,
      message: "Checked out successfully",
    };
  } catch (error) {
    console.error("Error during check-out:", error);
    
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return {
        success: false,
        error: "Already checked out",
        statusCode: 409,
      };
    }

    return {
      success: false,
      error: "Failed to check out",
      statusCode: 500,
    };
  }
}

export async function getCurrentCheckInStatus() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
      statusCode: 401,
    };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      include: {
        entries: {
          orderBy: { checkIn: "desc" },
        },
      },
    });

    const openEntry = attendance?.entries.find((entry) => !entry.checkOut);

    return {
      success: true,
      data: {
        hasCheckedIn: !!attendance,
        isCurrentlyCheckedIn: !!openEntry,
        lastEntry: attendance?.entries[0] || null,
        totalHours: attendance?.totalHours || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching check-in status:", error);
    return {
      success: false,
      error: "Failed to fetch check-in status",
      statusCode: 500,
    };
  }
}
