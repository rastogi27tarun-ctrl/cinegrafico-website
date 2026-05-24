import { db } from "../../../../lib/db";
import { requireEditor } from "../../../../lib/api-auth";

export async function GET() {
  const guard = await requireEditor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  const inquiries = await db.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return Response.json(inquiries);
}
