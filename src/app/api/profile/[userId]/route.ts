import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await params;

    const body = await request.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (body.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
    }

    if (body.loginId && body.loginId !== existingUser.loginId) {
      const loginIdExists = await prisma.user.findUnique({
        where: { loginId: body.loginId },
      });

      if (loginIdExists) {
        return NextResponse.json(
          { error: "Login ID already in use" },
          { status: 409 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name,
        email: body.email,
        loginId: body.loginId || null,
        mobile: body.mobile || null,
        department: body.department || null,
        manager: body.manager || null,
        location: body.location || null,
      },
      include: {
        company: true,
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
