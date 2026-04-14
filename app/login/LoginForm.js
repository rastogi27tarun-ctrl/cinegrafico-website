"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "./actions";

const initialState = { ok: false, error: "" };

export default function LoginForm({ callbackUrl }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state?.ok) {
      router.push(state.redirectTo || callbackUrl || "/admin");
      router.refresh();
    }
  }, [state, router, callbackUrl]);

  return (
    <form action={formAction} className="panel" style={{ padding: "1rem", maxWidth: 420 }}>
      <h2>CMS Login</h2>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <label>Email</label>
      <input name="email" type="email" required style={{ width: "100%", marginBottom: ".75rem" }} />
      <label>Password</label>
      <input name="password" type="password" required style={{ width: "100%", marginBottom: ".75rem" }} />
      {state?.error && <p style={{ color: "#ffb2b2" }}>{state.error}</p>}
      <button className="button" disabled={pending}>{pending ? "Signing in..." : "Sign in"}</button>
      <p style={{ color: "var(--muted)" }}>Seed users: admin@cinegrafico.local / admin12345, editor@cinegrafico.local / editor12345</p>
    </form>
  );
}
