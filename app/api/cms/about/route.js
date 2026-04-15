import { db } from "../../../../lib/db";
import { requireEditor } from "../../../../lib/api-auth";

export async function GET() {
  const data = await db.aboutContent.findUnique({ where: { id: "singleton" } });
  return Response.json(data);
}

export async function PUT(req) {
  const guard = await requireEditor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });
  const body = await req.json();
  const updated = await db.aboutContent.upsert({
    where: { id: "singleton" },
    update: {
      vision: body.vision ?? "",
      style: body.style ?? "",
      trust: body.trust ?? ""
    },
    create: {
      id: "singleton",
      vision: body.vision ?? "",
      style: body.style ?? "",
      trust: body.trust ?? ""
    }
  });
  return Response.json(updated);
}
