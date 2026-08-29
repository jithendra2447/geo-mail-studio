import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const workspaceId = formData.get("workspaceId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required for asset storage" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Generate clean unique filename
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${workspaceId}_${Date.now()}_${sanitizedFilename}`;
    const filePath = path.join(uploadsDir, filename);

    // Save file locally
    await writeFile(filePath, buffer);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const fileUrl = `${baseUrl}/uploads/${filename}`;

    console.log(`[Self-Hosted Storage Upload]: Saved asset ${filename} (${file.size} bytes)`);

    return NextResponse.json(
      {
        success: true,
        message: "Asset uploaded successfully to self-hosted storage",
        url: fileUrl,
        filename,
        size: file.size,
        workspaceId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Upload API Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
