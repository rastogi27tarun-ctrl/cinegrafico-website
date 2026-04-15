import { auth } from "./auth";

export async function requireEditor() {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  if (!["ADMIN", "EDITOR"].includes(session.user.role)) {
    return { ok: false, status: 403, error: "Forbidden" };
  }
  return { ok: true, session };
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return { ok: false, status: 401, error: "Unauthorized" };
  if (session.user.role !== "ADMIN") return { ok: false, status: 403, error: "Forbidden" };
  return { ok: true, session };
}
