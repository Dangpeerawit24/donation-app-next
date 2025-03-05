// app/api/uploads/[filename]/route.js
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { filename } = await params;
    const filePath = path.join(process.cwd(), "uploads/img/qrcodes", filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // ประเมินนามสกุลไฟล์
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    if (ext === ".png") contentType = "image/png";

    // สร้าง stream แล้วส่งไฟล์
    const fileStream = fs.createReadStream(filePath);
    return new NextResponse(fileStream, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    console.error("Error reading file:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
