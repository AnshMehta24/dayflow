import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";


// POST - Add a new skill
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: "User ID and skill name are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if skill already exists for this user
    const existingSkill = await prisma.skill.findFirst({
      where: {
        userId: userId,
        name: name.trim(),
      },
    });

    if (existingSkill) {
      return NextResponse.json(
        { error: "Skill already exists" },
        { status: 409 }
      );
    }

    // Create new skill
    const skill = await prisma.skill.create({
      data: {
        name: name.trim(),
        userId: userId,
      },
    });

    return NextResponse.json(
      {
        message: "Skill added successfully",
        data: skill,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding skill:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

