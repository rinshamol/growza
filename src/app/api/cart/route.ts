import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plantId, quantity } = await req.json();

  // Check if already in cart
  const existing = await prisma.cart.findFirst({
    where: { userId: session.user.id, plantId },
  });

  if (existing) {
    // Update quantity
    const updated = await prisma.cart.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
    return NextResponse.json(updated);
  }

  // Add to cart
  const cartItem = await prisma.cart.create({
    data: {
      userId: session.user.id,
      plantId,
      quantity,
    },
  });

  return NextResponse.json(cartItem, { status: 201 });
}

export async function GET() {
  const session = await auth();

  const plants = await prisma.plant.findMany({
    where: {
      isAvailable: true,
      stock: { gt: 0 },
      NOT: {
        sellerId: session?.user?.id ?? ""
      }
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