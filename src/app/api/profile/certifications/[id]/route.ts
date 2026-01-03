import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const certId = params.id;

    const certification = await prisma.certification.findUnique({
      where: { id: certId },
    });

    if (!certification) {
      return NextResponse.json(
        { error: "Certification not found" },
        { status: 404 }
      );
    }

    await prisma.certification.delete({
      where: { id: certId },
    });

    return NextResponse.json(
      { message: "Certification removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing certification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
