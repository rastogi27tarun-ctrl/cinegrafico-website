import PublicHeader from "@/components/PublicHeader";
import { db } from "@/lib/db";
import { isYouTubeUrl, toYouTubeEmbedUrl } from "@/lib/media";
import RelatedPhotosGallery from "@/components/RelatedPhotosGallery";

function getRelatedPhotos(item) {
  const tags = item?.tags;
  if (!tags || typeof tags !== "object" || Array.isArray(tags)) return [];
  const photos = tags.relatedPhotos;
  if (!Array.isArray(photos)) return [];
  return photos.map((v) => String(v || "")).filter((v) => v.length > 0);
}

export default async function PortfolioDetailPage({ params }) {
  const { id } = await params;
  const item = await db.portfolioItem.findUnique({ where: { id } });

  if (!item) {
    return (
      <>
        <PublicHeader />
        <main className="section">
          <div className="container">
            <article className="panel" style={{ padding: "1rem" }}>
              <h1 style={{ marginTop: 0 }}>Project not found</h1>
            </article>
          </div>
        </main>
      </>
    );
  }

  const relatedPhotos = getRelatedPhotos(item);

  return (
    <>
      <PublicHeader />
      <main className="section">
        <div className="container" style={{ display: "grid", gap: "1rem" }}>
          <div className="section-start-chip">
            <span className="section-start-label">Portfolio</span>
            <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
          </div>
          <article className="panel" style={{ overflow: "hidden" }}>
            {item.videoUrl && isYouTubeUrl(item.videoUrl) ? (
              <iframe
                src={toYouTubeEmbedUrl(item.videoUrl)}
                title={item.title || "Portfolio video"}
                style={{ width: "100%", aspectRatio: "16/9", border: 0, display: "block" }}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : item.videoUrl ? (
              <video src={item.videoUrl} poster={item.posterUrl || undefined} controls style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }} />
            ) : item.posterUrl ? (
              <img src={item.posterUrl} alt={item.title || "Portfolio item"} style={{ width: "100%", aspectRatio: "16/9", objectFit: "contain", background: "rgba(8,8,12,.92)", display: "block" }} />
            ) : (
              <div style={{ width: "100%", aspectRatio: "16/9", background: "rgba(255,255,255,.04)" }} />
            )}
            <div style={{ padding: "1rem" }}>
              <h1 style={{ marginTop: 0 }}>{item.title || "Untitled Project"}</h1>
              {relatedPhotos.length > 0 && (
                <section style={{ marginBottom: ".9rem" }}>
                  <h2 style={{ marginTop: 0 }}>Related Photos</h2>
                  <RelatedPhotosGallery photos={relatedPhotos} title={item.title || "Project"} />
                </section>
              )}
              <p style={{ marginBottom: 0, color: "var(--muted)", lineHeight: 1.75 }}>{item.description || "No description yet."}</p>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
