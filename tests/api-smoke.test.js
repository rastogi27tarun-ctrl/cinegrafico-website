/* Basic API smoke placeholders.
   Run after env + DB setup with `npm run dev`.
*/

async function run() {
  const base = "http://localhost:3000";
  const healthChecks = [
    "/api/cms/hero",
    "/api/cms/about",
    "/api/cms/contact",
    "/api/cms/services",
    "/api/cms/portfolio",
    "/api/cms/clients"
  ];

  for (const path of healthChecks) {
    const res = await fetch(base + path);
    if (!res.ok) throw new Error(`Failed ${path}: ${res.status}`);
    console.log("OK", path);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
