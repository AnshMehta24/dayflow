import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serielizeData";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, id: true },
    });

    const isHR = currentUser?.role === "HR";
    const isOwnProfile = currentUser?.id === userId;

    if (!isHR && !isOwnProfile) {
      return NextResponse.json(
        { error: "Forbidden - You can only view your own salary information" },
        { status: 403 }
      );
    }

    const salaryInfo = await prisma.salaryInfo.findUnique({
      where: { userId },
    });

    if (!salaryInfo) {
      return NextResponse.json(
        { error: "Salary information not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Salary information fetched successfully",
      data: serialize(salaryInfo),
    });
  } catch (error) {
    console.error("Error fetching salary info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== "HR") {
      return NextResponse.json(
        { error: "Forbidden - Only HR can update salary information" },
        { status: 403 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    const salaryData = {
      monthlyWage: parseFloat(body.monthlyWage) || 0,
      yearlyWage: parseFloat(body.yearlyWage) || 0,
      workingDaysPerWeek: parseInt(body.workingDaysPerWeek) || 5,
      breakTimeHours: parseFloat(body.breakTimeHours) || 1,

      basicSalary: parseFloat(body.basicSalary) || 0,
      basicSalaryPercent: parseFloat(body.basicSalaryPercent) || 0,

      houseRentAllowance: parseFloat(body.houseRentAllowance) || 0,
      hraPercent: parseFloat(body.hraPercent) || 0,

      standardAllowance: parseFloat(body.standardAllowance) || 0,
      standardPercent: parseFloat(body.standardPercent) || 0,

      performanceBonus: parseFloat(body.performanceBonus) || 0,
      performancePercent: parseFloat(body.performancePercent) || 0,

      leaveTravelAllowance: parseFloat(body.leaveTravelAllowance) || 0,
      ltaPercent: parseFloat(body.ltaPercent) || 0,

      fixedAllowance: parseFloat(body.fixedAllowance) || 0,
      fixedPercent: parseFloat(body.fixedPercent) || 0,

      employeePF: parseFloat(body.employeePF) || 0,
      employeePFPercent: parseFloat(body.employeePFPercent) || 0,

      employerPF: parseFloat(body.employerPF) || 0,
      employerPFPercent: parseFloat(body.employerPFPercent) || 0,

      professionalTax: parseFloat(body.professionalTax) || 0,
    };

    const totalComponents =
      salaryData.basicSalary +
      salaryData.houseRentAllowance +
      salaryData.standardAllowance +
      salaryData.performanceBonus +
      salaryData.leaveTravelAllowance +
      salaryData.fixedAllowance;

    if (totalComponents > salaryData.monthlyWage + 0.01) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: `Total salary components (${totalComponents.toFixed(
            2
          )}) exceed monthly wage (${salaryData.monthlyWage.toFixed(2)})`,
        },
        { status: 400 }
      );
    }

    const salaryInfo = await prisma.salaryInfo.upsert({
      where: { userId },
      update: salaryData,
      create: {
        userId,
        ...salaryData,
      },
    });

    return NextResponse.json({
      message: "Salary information updated successfully",
      data: serialize(salaryInfo),
    });
  } catch (error) {
    console.error("Error updating salary info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== "HR") {
      return NextResponse.json(
        { error: "Forbidden - Only HR can delete salary information" },
        { status: 403 }
      );
    }

    await prisma.salaryInfo.delete({
      where: { userId },
    });

    return NextResponse.json({
      message: "Salary information deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting salary info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
