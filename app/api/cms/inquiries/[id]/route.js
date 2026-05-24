import { db } from "../../../../../lib/db";
import { requireEditor } from "../../../../../lib/api-auth";

export async function DELETE(_req, { params }) {
  const guard = await requireEditor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  try {
    await db.contactInquiry.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Inquiry not found." }, { status: 404 });
  }
}
