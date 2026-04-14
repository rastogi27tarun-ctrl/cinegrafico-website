import { db } from "@/lib/db";
import { requireEditor } from "@/lib/api-auth";

export async function PUT(req, { params }) {
  const guard = await requireEditor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });
  const { id } = await params;
  const body = await req.json();
  const updated = await db.portfolioItem.update({
    where: { id },
    data: {
      title: body.title ?? "",
      description: body.description ?? "",
      videoUrl: body.videoUrl ?? "",
      posterUrl: body.posterUrl ?? "",
      tags: body.tags ?? [],
      position: Number(body.position ?? 0)
    }
  });
  return Response.json(updated);
}

export async function DELETE(_req, { params }) {
  const guard = await requireEditor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });
  const { id } = await params;
  await db.portfolioItem.delete({ where: { id } });
  return Response.json({ ok: true });
}
