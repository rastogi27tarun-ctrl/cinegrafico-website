import { db } from "../../../lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim();
    const project = String(body.project ?? "").trim();
    const budget = String(body.budget ?? "").trim();

    if (!email) {
      return Response.json({ error: "Email is required." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const inquiry = await db.contactInquiry.create({
      data: { email, project, budget }
    });

    return Response.json({ ok: true, id: inquiry.id }, { status: 201 });
  } catch (error) {
    console.error("Contact inquiry create failed:", error);
    return Response.json({ error: "Could not save your inquiry. Please try again." }, { status: 500 });
  }
}
