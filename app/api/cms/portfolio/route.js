import { db } from "@/lib/db";
import { requireEditor } from "@/lib/api-auth";

export async function GET() {
  const data = await db.portfolioItem.findMany({ orderBy: { position: "asc" } });
  return Response.json(data);
}

export async function POST(req) {
  const guard = await requireEditor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });
  const body = await req.json();
  const created = await db.portfolioItem.create({
    data: {
      title: body.title ?? "",
      description: body.description ?? "",
      videoUrl: body.videoUrl ?? "",
      posterUrl: body.posterUrl ?? "",
      tags: body.tags ?? [],
      position: Number(body.position ?? 0)
    }
  });
  return Response.json(created, { status: 201 });
}
