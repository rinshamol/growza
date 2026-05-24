import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const plants = await prisma.plant.findMany({
    where: { isAvailable: true, stock: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    include: {
      seller: {
        select: { name: true, address: true }
      }
    }
  });

  return NextResponse.json(plants);
}