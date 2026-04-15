"use client";

import { useEffect, useMemo, useRef } from "react";
import { isYouTubeUrl, toYouTubeEmbedUrl } from "../lib/media";
import Link from "next/link";

export default function PortfolioCarousel({ items, ariaLabel }) {
  const trackRef = useRef(null);

  const portfolioItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const scrollByCards = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(".portfolio-card");
    if (!card) return;
    const gap = parseFloat(getComputedStyle(track).gap || "0") || 0;
    const step = card.getBoundingClientRect().width + gap;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track || portfolioItems.length < 2) return;

    let paused = false;

    const stepForward = () => {
      if (paused) return;
      const card = track.querySelector(".portfolio-card");
      if (!card) return;
      const gap = parseFloat(getComputedStyle(track).gap || "0") || 0;
      const step = card.getBoundingClientRect().width + gap;
      const nextLeft = track.scrollLeft + step;
      const maxLeft = track.scrollWidth - track.clientWidth;

      if (nextLeft >= maxLeft - 2) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollTo({ left: nextLeft, behavior: "smooth" });
      }
    };

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };

    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", resume);
    track.addEventListener("focusin", pause);
    track.addEventListener("focusout", resume);
    track.addEventListener("pointerdown", pause);
    track.addEventListener("pointerup", resume);

    const timer = window.setInterval(stepForward, 2600);

    return () => {
      window.clearInterval(timer);
      track.removeEventListener("mouseenter", pause);
      track.removeEventListener("mouseleave", resume);
      track.removeEventListener("focusin", pause);
      track.removeEventListener("focusout", resume);
      track.removeEventListener("pointerdown", pause);
      track.removeEventListener("pointerup", resume);
    };
  }, [portfolioItems.length]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: ".5rem", marginBottom: ".75rem" }}>
        <button className="button" type="button" onClick={() => scrollByCards(-1)} style={{ padding: ".5rem .8rem" }}>Prev</button>
        <button className="button" type="button" onClick={() => scrollByCards(1)} style={{ padding: ".5rem .8rem" }}>Next</button>
      </div>

      <div ref={trackRef} className="portfolio-carousel" aria-label={ariaLabel || "Portfolio carousel"}>
        {portfolioItems.map((item) => (
          <article
            key={item.id}
            className="panel portfolio-card"
            onMouseEnter={(e) => {
              const video = e.currentTarget.querySelector("video");
              if (!video) return;
              video.play().catch(() => {});
            }}
            onMouseLeave={(e) => {
              const video = e.currentTarget.querySelector("video");
              if (!video) return;
              video.pause();
              video.currentTime = 0;
            }}
          >
            <div className="portfolio-card-media">
              {item.videoUrl && isYouTubeUrl(item.videoUrl) ? (
                <iframe
                  src={toYouTubeEmbedUrl(item.videoUrl)}
                  title={item.title || "Portfolio video"}
                  className="portfolio-preview-video"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : item.videoUrl ? (
                <video
                  src={item.videoUrl}
                  poster={item.posterUrl || undefined}
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="portfolio-preview-video"
                />
              ) : resolvePortfolioPoster(item) ? (
                <img src={resolvePortfolioPoster(item)} alt={item.title || "Portfolio item"} className="portfolio-preview-image" />
              ) : (
                <div className="portfolio-preview-empty" />
              )}
            </div>
            <div className="portfolio-card-body">
              <h3>{item.title || "Untitled Project"}</h3>
              <p>{item.description || "No description yet."}</p>
              <div style={{ marginTop: ".6rem" }}>
                <Link href={`/portfolio/${item.id}`} className="button" style={{ padding: ".45rem .75rem" }}>
                  Open Project
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function resolvePortfolioPoster(item) {
  if (item?.posterUrl) return item.posterUrl;
  const tags = item?.tags && typeof item.tags === "object" && !Array.isArray(item.tags) ? item.tags : {};
  const related = Array.isArray(tags.relatedPhotos) ? tags.relatedPhotos : [];
  const firstValid = related.find((url) => String(url || "").trim().length > 0);
  return firstValid ? String(firstValid) : "";
}
