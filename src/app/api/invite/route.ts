import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

const inviteSchema = z.object({
  companyName: z.string().min(2),
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  confirmPassword: z.string(),
  role: z.enum(["HR", "EMPLOYEE"]).default("EMPLOYEE"),
  companyId: z.string(),
});

function generateLoginId(
  companyName: string,
  firstName: string,
  lastName: string,
  joiningYear: number,
  serialNumber: number
): string {
  const companyPrefix = companyName.substring(0, 2).toUpperCase();
  const nameInitials = (
    firstName.substring(0, 2) + lastName.substring(0, 2)
  ).toUpperCase();
  const serial = serialNumber.toString().padStart(4, "0");
  return `${companyPrefix}${nameInitials}${joiningYear}${serial}`;
}

async function getNextSerialNumber(
  companyId: string,
  year: number
): Promise<number> {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  const count = await prisma.user.count({
    where: {
      companyId: companyId,
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
  });

  return count + 1;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user.role !== "HR") {
      return NextResponse.json(
        { error: "Cant invite the member" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const validatedData = inviteSchema.parse(body);

    if (session?.user.companyId !== validatedData.companyId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 400 });
    }

    if (validatedData.password !== validatedData.confirmPassword) {
      return NextResponse.json(
        { error: "Passwords don't match" },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: validatedData.companyId },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const currentYear = new Date().getFullYear();
    const serialNumber = await getNextSerialNumber(
      validatedData.companyId,
      currentYear
    );

    const nameParts = validatedData.name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts[nameParts.length - 1] || nameParts[0] || "";

    const loginId = generateLoginId(
      validatedData.companyName,
      firstName,
      lastName,
      currentYear,
      serialNumber
    );

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
        companyId: validatedData.companyId,
        loginId: loginId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Employee invited successfully",
        loginId: loginId,
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
