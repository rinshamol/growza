import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Make sure seller owns this plant
  const plant = await prisma.plant.findFirst({
    where: { id, sellerId: session.user.id },
  });

  if (!plant) {
    return NextResponse.json({ error: "Plant not found" }, { status: 404 });
  }

  await prisma.plant.delete({ where: { id } });

  return NextResponse.json({ message: "Plant deleted successfully" });
}