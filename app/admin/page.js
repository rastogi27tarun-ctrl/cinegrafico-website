import { redirect } from "next/navigation";
import { auth, signOut } from "../../lib/auth";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");

  return (
    <main className="section">
      <div className="container" style={{ display: "grid", gap: "1rem" }}>
        <div className="panel" style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong>CMS Dashboard</strong>
            <p style={{ color: "var(--muted)", margin: 0 }}>{session.user.email} ({session.user.role})</p>
          </div>
          <form action={logoutAction}>
            <button className="button" type="submit">Logout</button>
          </form>
        </div>
        <AdminClient />
      </div>
    </main>
  );
}
