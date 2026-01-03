import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: "User ID and certification name are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if certification already exists for this user
    const existingCert = await prisma.certification.findFirst({
      where: {
        userId: userId,
        name: name.trim(),
      },
    });

    if (existingCert) {
      return NextResponse.json(
        { error: "Certification already exists" },
        { status: 409 }
      );
    }

    const certification = await prisma.certification.create({
      data: {
        name: name.trim(),
        userId: userId,
      },
    });

    return NextResponse.json(
      {
        message: "Certification added successfully",
        data: certification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding certification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
