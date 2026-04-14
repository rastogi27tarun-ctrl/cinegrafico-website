"use server";

import { signIn } from "@/lib/auth";

export async function loginAction(_prevState, formData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const callbackUrl = String(formData.get("callbackUrl") || "/admin");
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (result?.error) {
      return { ok: false, error: "Invalid credentials" };
    }

    return { ok: true, redirectTo: callbackUrl };
  } catch (_e) {
    return { ok: false, error: "Invalid credentials" };
  }
}
