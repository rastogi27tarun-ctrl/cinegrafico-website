import PublicHeader from "../../components/PublicHeader";
import { getPublicCmsData } from "../../lib/cms";
import { isYouTubeUrl, toYouTubeEmbedUrl } from "../../lib/media";
import { getPortfolioSections } from "../../lib/portfolio";
import Link from "next/link";

export default async function PortfolioPage() {
  const { portfolio } = await getPublicCmsData();
  const portfolioSections = getPortfolioSections(portfolio);

  return (
    <>
      <PublicHeader />
      <main>
        <section className="section">
          <div className="container">
            <div className="section-start-chip">
              <span className="section-start-label">Portfolio</span>
              <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
            </div>
            <h1 style={{ marginTop: 0, fontSize: "clamp(2rem,4.5vw,3.2rem)" }}>All Portfolio Items</h1>
            <p style={{ color: "var(--muted)", marginTop: 0 }}>
              Explore the complete collection of projects.
            </p>

            {portfolioSections.map(({ type, items }) => (
                <section key={type} style={{ marginBottom: "1.25rem" }}>
                  <h2 style={{ marginTop: 0 }}>{type}</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1rem" }}>
                    {items.map((item) => (
                      <article key={item.id} className="panel" style={{ overflow: "hidden" }}>
                        {item.videoUrl && isYouTubeUrl(item.videoUrl) ? (
                          <iframe
                            src={toYouTubeEmbedUrl(item.videoUrl)}
                            title={item.title || "Portfolio video"}
                            style={{ width: "100%", aspectRatio: "16/10", border: 0, display: "block" }}
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          />
                        ) : item.videoUrl ? (
                          <video
                            src={item.videoUrl}
                            poster={item.posterUrl || undefined}
                            controls
                            style={{ width: "100%", aspectRatio: "16/10", objectFit: "cover", display: "block" }}
                          />
                        ) : item.posterUrl ? (
                          <img
                            src={item.posterUrl}
                            alt={item.title || "Portfolio item"}
                            style={{ width: "100%", aspectRatio: "16/10", objectFit: "contain", background: "rgba(8,8,12,.92)", display: "block" }}
                          />
                        ) : (
                          <div style={{ width: "100%", aspectRatio: "16/10", background: "rgba(255,255,255,.04)" }} />
                        )}
                        <div style={{ padding: "1rem" }}>
                          <h3 style={{ margin: 0 }}>{item.title || "Untitled Project"}</h3>
                          <p style={{ color: "var(--muted)", marginBottom: 0 }}>{item.description || "No description yet."}</p>
                          <div style={{ marginTop: ".7rem" }}>
                            <Link href={`/portfolio/${item.id}`} className="button" style={{ padding: ".45rem .75rem" }}>
                              Open Project
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
