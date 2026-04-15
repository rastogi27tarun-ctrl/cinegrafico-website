import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const rawCallbackUrl = params?.callbackUrl || "/admin";
  const callbackUrl = String(rawCallbackUrl).startsWith("/") ? String(rawCallbackUrl) : "/admin";
  return (
    <main className="section">
      <div className="container">
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
