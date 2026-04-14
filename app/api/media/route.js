import { db } from "@/lib/db";
import { requireEditor } from "@/lib/api-auth";

export async function GET() {
  const data = await db.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return Response.json(data);
}

export async function DELETE(req) {
  const guard = await requireEditor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  await db.mediaAsset.delete({ where: { id } });
  return Response.json({ ok: true });
}
