import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageUrl } = await req.json();

  try {
    const urlParts = imageUrl.split("/");
    const filenameWithExt = urlParts[urlParts.length - 1];
    const filename = filenameWithExt.split(".")[0];
    const publicId = `growza/${filename}`;
    await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ message: "Image deleted" });
  } catch (err) {
    console.log("Cloudinary delete error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}