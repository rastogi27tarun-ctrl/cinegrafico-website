import { db } from "@/lib/db";
import { requireEditor } from "@/lib/api-auth";

export async function GET() {
  const data = await db.heroContent.findUnique({ where: { id: "singleton" } });
  return Response.json(data);
}

export async function PUT(req) {
  const guard = await requireEditor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });
  const body = await req.json();
  const updated = await db.heroContent.upsert({
    where: { id: "singleton" },
    update: {
      heading: body.heading ?? "",
      subheading: body.subheading ?? "",
      ctaText: body.ctaText ?? "",
      videoUrl: body.videoUrl ?? null
    },
    create: {
      id: "singleton",
      heading: body.heading ?? "",
      subheading: body.subheading ?? "",
      ctaText: body.ctaText ?? "",
      videoUrl: body.videoUrl ?? null
    }
  });
  return Response.json(updated);
}
