"use client";

import { useEffect, useState } from "react";

export default function RelatedPhotosGallery({ photos, title }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const activePhoto = activeIndex >= 0 ? photos[activeIndex] : "";

  useEffect(() => {
    if (activeIndex < 0) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setActiveIndex(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex]);

  return (
    <>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
        {photos.map((photoUrl, index) => (
          <article key={`${title}-related-${index}`} className="panel" style={{ overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              style={{ all: "unset", cursor: "zoom-in", display: "block", width: "100%" }}
              aria-label={`Open related photo ${index + 1}`}
            >
              <img
                src={photoUrl}
                alt={`${title || "Project"} related ${index + 1}`}
                style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block" }}
              />
            </button>
          </article>
        ))}
      </div>

      {activePhoto && (
        <div
          onClick={() => setActiveIndex(-1)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.88)",
            display: "grid",
            placeItems: "center",
            padding: "1rem",
            zIndex: 80,
            cursor: "zoom-out"
          }}
        >
          <img
            src={activePhoto}
            alt={`${title || "Project"} full view`}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "min(96vw, 1400px)", maxHeight: "92vh", width: "auto", height: "auto", borderRadius: "12px", boxShadow: "0 24px 64px rgba(0,0,0,.45)" }}
          />
        </div>
      )}
    </>
  );
}
