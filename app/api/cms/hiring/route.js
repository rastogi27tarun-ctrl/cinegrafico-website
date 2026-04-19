import { db } from "../../../../lib/db";
import { requireEditor } from "../../../../lib/api-auth";

export async function GET() {
  try {
    const data = await db.hiringContent.findUnique({ where: { id: "singleton" } });
    return Response.json(data);
  } catch (err) {
    console.error("[cms/hiring GET]", err);
    return Response.json(null, { status: 200 });
  }
}

export async function PUT(req) {
  try {
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
  } catch (err) {
    console.error("[cms/hiring PUT]", err);
    const message =
      err instanceof Error ? err.message : "Failed to save hiring content";
    return Response.json(
      {
        error: message.includes("does not exist") || message.includes("Unknown table")
          ? "Hiring table missing. Run: npx prisma db push (or migrate deploy) on the server, then redeploy."
          : message
      },
      { status: 500 }
    );
  }
}
