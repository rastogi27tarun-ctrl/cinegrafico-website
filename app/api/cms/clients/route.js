import { db } from "@/lib/db";
import { requireEditor } from "@/lib/api-auth";

export async function GET() {
  const data = await db.client.findMany({ orderBy: { position: "asc" } });
  return Response.json(data);
}

export async function POST(req) {
  const guard = await requireEditor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });
  const body = await req.json();
  const created = await db.client.create({
    data: {
      name: body.name ?? "",
      logoUrl: body.logoUrl ?? "",
      position: Number(body.position ?? 0)
    }
  });
  return Response.json(created, { status: 201 });
}
