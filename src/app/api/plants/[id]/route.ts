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

  const plant = await prisma.plant.findFirst({
    where: { id, sellerId: session.user.id },
  });

  if (!plant) {
    return NextResponse.json({ error: "Plant not found" }, { status: 404 });
  }

  // Delete image from Cloudinary if exists
  if (plant.imageUrl) {
    try {
      const cloudinary = (await import("@/lib/cloudinary")).default;
      // Extract public_id from URL
      // URL format: https://res.cloudinary.com/cloud/image/upload/v123/growza/filename.jpg
      const urlParts = plant.imageUrl.split("/");
      const filenameWithExt = urlParts[urlParts.length - 1];
      const filename = filenameWithExt.split(".")[0];
      const publicId = `growza/${filename}`;
      
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.log("Cloudinary delete failed:", err);
      // Continue with plant deletion even if image delete fails
    }
  }

  await prisma.plant.delete({ where: { id } });

  return NextResponse.json({ message: "Plant deleted successfully" });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  // Make sure seller owns this plant
  const existing = await prisma.plant.findFirst({
    where: { id, sellerId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Plant not found" }, { status: 404 });
  }

  const updated = await prisma.plant.update({
  where: { id },
  data: {
    name: body.name,
    nameML: body.nameML,
    scientificName: body.scientificName,
    description: body.description,
    price: Number(body.price),
    stock: Number(body.stock),
    category: body.category,
    imageUrl: body.imageUrl, 
  },
});

  return NextResponse.json(updated);
}