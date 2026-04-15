"use server";

import { AuthError } from "next-auth";
import { signIn } from "../../lib/auth";

export async function loginAction(_prevState, formData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const callbackUrl = String(formData.get("callbackUrl") || "/admin");
  const redirectTo = callbackUrl.startsWith("/") ? callbackUrl : "/admin";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo
    });
    return { ok: true, error: "" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Invalid credentials" };
    }
    throw error;
  }
}
