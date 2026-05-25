import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  
  console.log("Session user id:", session?.user?.id);

  const plants = await prisma.plant.findMany({
    where: {
      isAvailable: true,
      stock: { gt: 0 },
      ...(session?.user?.id && {
        NOT: { sellerId: session.user.id }
      })
    },
    orderBy: { createdAt: "desc" },
    include: {
      seller: {
        select: { name: true, address: true }
      }
    }
  });

  return NextResponse.json(plants);
}