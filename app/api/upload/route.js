import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { db } from "../../../lib/db";
import { requireEditor } from "../../../lib/api-auth";

export async function POST(req) {
  const guard = await requireEditor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  if (buffer.byteLength > 50 * 1024 * 1024) {
    return Response.json({ error: "File too large" }, { status: 400 });
  }

  let url = "";
  const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const canUseCloudinary =
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET);

  if (canUseCloudinary) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "cinegrafico";
    const resourceType = String(file.type || "").startsWith("video/") ? "video" : "image";

    const uploadedUrl = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, public_id: safeName.replace(/\.[^/.]+$/, ""), resource_type: resourceType, overwrite: false },
        (error, result) => {
          if (error || !result?.secure_url) return reject(error || new Error("Cloud upload failed"));
          resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });
    url = String(uploadedUrl);
  } else {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const fullPath = path.join(uploadsDir, safeName);
    await writeFile(fullPath, buffer);
    url = `/uploads/${safeName}`;
  }

  await db.mediaAsset.create({
    data: {
      url,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      alt: ""
    }
  });

  return Response.json({ url, fileName: file.name });
}
