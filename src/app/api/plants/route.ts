import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const plantSchema = z.object({
  name: z.string().min(2),
  nameML: z.string().optional(),
  scientificName: z.string().optional(),
  description: z.string().min(10),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  category: z.string(),
  imageUrl: z.string().optional(),
});

// GET — fetch seller's plants
export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plants = await prisma.plant.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(plants);
}

// POST — add new plant
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = plantSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const plant = await prisma.plant.create({
    data: {
      ...result.data,
      sellerId: session.user.id,
    },
  });

  return NextResponse.json(plant, { status: 201 });
}
