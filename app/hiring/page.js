import PublicHeader from "../../components/PublicHeader";
import { getPublicCmsData } from "../../lib/cms";

export const metadata = {
  title: "Hiring | Cinegrafico Studios"
};

export default async function HiringPage() {
  const { hiring } = await getPublicCmsData();

  const visible = Boolean(hiring?.isVisible);
  const roleTitle = hiring?.roleTitle?.trim() || "Open role";
  const profileDescription = hiring?.profileDescription?.trim() || "";
  const whoCanApply = hiring?.whoCanApply?.trim() || "";
  const applyLabel = hiring?.applyButtonLabel?.trim() || "Apply";
  const applyUrl = hiring?.applyUrl?.trim() || "";

  return (
    <>
      <PublicHeader />
      <main className="section">
        <div className="container" style={{ maxWidth: "720px" }}>
          <div className="section-start-chip">
            <span className="section-start-label">Careers</span>
            <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
          </div>

          {!visible ? (
            <article className="panel" style={{ padding: "1.25rem" }}>
              <h1 style={{ marginTop: 0 }}>Hiring</h1>
              <p style={{ color: "var(--muted)", marginBottom: 0, lineHeight: 1.7 }}>
                We&apos;re not listing open roles on the site right now. Check back later or reach out through{" "}
                <a href="/#contact" style={{ color: "var(--gold-1)" }}>Contact</a>.
              </p>
            </article>
          ) : (
            <article className="panel" style={{ padding: "1.25rem" }}>
              <h1 style={{ marginTop: 0 }}>{roleTitle}</h1>
              {profileDescription ? (
                <section style={{ marginBottom: "1.25rem" }}>
                  <h2 style={{ fontSize: "1.05rem", marginBottom: ".5rem", color: "rgba(255,255,255,.85)" }}>About the role</h2>
                  <p style={{ color: "var(--muted)", margin: 0, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{profileDescription}</p>
                </section>
              ) : null}
              {whoCanApply ? (
                <section style={{ marginBottom: "1.25rem" }}>
                  <h2 style={{ fontSize: "1.05rem", marginBottom: ".5rem", color: "rgba(255,255,255,.85)" }}>Who can apply</h2>
                  <p style={{ color: "var(--muted)", margin: 0, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{whoCanApply}</p>
                </section>
              ) : null}
              {applyUrl ? (
                <a href={applyUrl} className="button" target="_blank" rel="noopener noreferrer">
                  {applyLabel}
                </a>
              ) : null}
            </article>
          )}
        </div>
      </main>
    </>
  );
}
