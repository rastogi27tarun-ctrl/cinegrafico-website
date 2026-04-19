import { db } from "../../../../lib/db";
import { requireEditor } from "../../../../lib/api-auth";

export async function GET() {
  const data = await db.hiringContent.findUnique({ where: { id: "singleton" } });
  return Response.json(data);
}

export async function PUT(req) {
  const guard = await requireEditor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });
  const body = await req.json();
  const updated = await db.hiringContent.upsert({
    where: { id: "singleton" },
    update: {
      isVisible: Boolean(body.isVisible),
      roleTitle: body.roleTitle ?? "",
      profileDescription: body.profileDescription ?? "",
      whoCanApply: body.whoCanApply ?? "",
      applyButtonLabel: body.applyButtonLabel ?? "Apply",
      applyUrl: body.applyUrl ?? ""
    },
    create: {
      id: "singleton",
      isVisible: Boolean(body.isVisible),
      roleTitle: body.roleTitle ?? "",
      profileDescription: body.profileDescription ?? "",
      whoCanApply: body.whoCanApply ?? "",
      applyButtonLabel: body.applyButtonLabel ?? "Apply",
      applyUrl: body.applyUrl ?? ""
    }
  });
  return Response.json(updated);
}
