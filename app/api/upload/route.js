import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
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
    Boolean(process.env.CLOUDINARY_UPLOAD_PRESET);

  if (canUseCloudinary) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    const resourceType = String(file.type || "").startsWith("video/") ? "video" : "image";

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", uploadPreset);

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: cloudinaryFormData
      }
    );
    const cloudinaryData = await cloudinaryRes.json();
    if (!cloudinaryRes.ok || !cloudinaryData?.secure_url) {
      return Response.json({ error: cloudinaryData?.error?.message || "Cloud upload failed" }, { status: 500 });
    }

    url = String(cloudinaryData.secure_url);
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
