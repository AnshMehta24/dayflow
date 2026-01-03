import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/uploadToCloud";

const signUpSchema = z
  .object({
    companyName: z.string().min(2),
    name: z.string().min(2),
    email: z.email(),
    phone: z.string(),
    password: z.string().min(8),
    confirmPassword: z.string(),
    companyLogo: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
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
    const body = await request.json();

    const validatedData = signUpSchema.parse(body);

    let logoUrl: string;
    if (validatedData.companyLogo) {
      try {
        logoUrl = await uploadToCloudinary(validatedData.companyLogo);
        console.log(logoUrl);
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return NextResponse.json(
          { error: "Failed to upload company logo" },
          { status: 400 }
        );
      }
    }

    const existingCompany = await prisma.company.findUnique({
      where: { email: validatedData.email },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: "Company with this email already exists" },
        { status: 400 }
      );
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

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: validatedData.companyName,
          email: validatedData.email,
          companyLogo: logoUrl || " ",
          phone: validatedData.phone,
        },
      });

      const currentYear = new Date().getFullYear();

      const serialNumber = await getNextSerialNumber(company.id, currentYear);

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

      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          role: "HR",
          companyId: company.id,
          loginId: loginId,
        },
      });

      return { company, user, loginId };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Company and user created successfully",
        loginId: result.loginId,
        companyId: result.company.id,
        userId: result.user.id,
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

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
