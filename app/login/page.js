import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl || "/admin";
  return (
    <main className="section">
      <div className="container">
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
