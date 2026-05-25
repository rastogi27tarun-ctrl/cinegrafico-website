import { db } from "../../../../lib/db";
import { requireEditor } from "../../../../lib/api-auth";

function normalizeRating(value) {
  const rating = Number(value ?? 5);
  if (!Number.isFinite(rating)) return 5;
  return Math.min(5, Math.max(1, Math.round(rating)));
}

export async function GET() {
  const data = await db.testimonial.findMany({ orderBy: { position: "asc" } });
  return Response.json(data);
}

export async function POST(req) {
  const guard = await requireEditor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  const body = await req.json();
  const featured = Boolean(body.featured);
  const data = {
    name: body.name ?? "",
    company: body.company ?? "",
    role: body.role ?? "",
    testimonial: body.testimonial ?? "",
    rating: normalizeRating(body.rating),
    imageUrl: body.imageUrl ?? "",
    featured,
    position: Number(body.position ?? 0)
  };

  const created = await db.$transaction(async (tx) => {
    if (featured) {
      await tx.testimonial.updateMany({ data: { featured: false } });
    }
    return tx.testimonial.create({ data });
  });

  return Response.json(created, { status: 201 });
}
