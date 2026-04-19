import { db } from "../../../../lib/db";
import { requireEditor } from "../../../../lib/api-auth";

export async function GET() {
  const data = await db.teamMember.findMany({ orderBy: { position: "asc" } });
  return Response.json(data);
}

export async function POST(req) {
  const guard = await requireEditor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });
  const body = await req.json();
  const created = await db.teamMember.create({
    data: {
      slug: body.slug ?? `member-${Date.now()}`,
      name: body.name ?? "New Team Member",
      subtitle: body.subtitle ?? "",
      description: body.description ?? "",
      photoUrl: body.photoUrl ?? null,
      position: Number(body.position ?? 0)
    }
  });
  return Response.json(created, { status: 201 });
}
