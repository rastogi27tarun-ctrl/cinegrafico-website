import { db } from "../../../../lib/db";
import { requireEditor } from "../../../../lib/api-auth";

export async function GET() {
  const data = await db.contactContent.findUnique({ where: { id: "singleton" } });
  return Response.json(data);
}

export async function PUT(req) {
  const guard = await requireEditor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });
  const body = await req.json();
  const updated = await db.contactContent.upsert({
    where: { id: "singleton" },
    update: {
      email: body.email ?? "",
      phone: body.phone ?? "",
      whatsapp: body.whatsapp ?? "",
      location: body.location ?? ""
    },
    create: {
      id: "singleton",
      email: body.email ?? "",
      phone: body.phone ?? "",
      whatsapp: body.whatsapp ?? "",
      location: body.location ?? ""
    }
  });
  return Response.json(updated);
}
