"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "./actions";

export default function LoginForm({ callbackUrl }) {
  const [state, formAction] = useFormState(loginAction, { ok: false, error: "" });

  return (
    <form action={formAction} className="panel" style={{ padding: "1rem", maxWidth: 420 }}>
      <h2>CMS Login</h2>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <label>Email</label>
      <input name="email" type="email" required style={{ width: "100%", marginBottom: ".75rem" }} />
      <label>Password</label>
      <input name="password" type="password" required style={{ width: "100%", marginBottom: ".75rem" }} />
      {state?.error && <p style={{ color: "#ffb2b2" }}>{state.error}</p>}
      <SubmitButton />
      <p style={{ color: "var(--muted)" }}>
        Seed users:
        {" "}
        {process.env.NODE_ENV === "production"
          ? "admin@cinegrafico.com / change-me-admin, editor@cinegrafico.com / change-me-editor"
          : "admin@cinegrafico.local / admin12345, editor@cinegrafico.local / editor12345"}
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="button" disabled={pending}>{pending ? "Signing in..." : "Sign in"}</button>;
}
