import { db } from "../../../../../lib/db";
import { requireEditor } from "../../../../../lib/api-auth";
import { applyCmsOrder } from "../../../../../lib/reorder-cms";

export async function PUT(req) {
  const guard = await requireEditor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  try {
    const body = await req.json();
    await applyCmsOrder(db, db.service, body.ids);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error?.message || "Invalid reorder payload" }, { status: 400 });
  }
}
