"use client";

import { useState } from "react";
import { isYouTubeUrl, toYouTubeEmbedUrl } from "../lib/media";
import { getHighlightBody } from "../lib/highlight";

export default function HighlightShowcase({ item }) {
  const [mediaOrientation, setMediaOrientation] = useState("horizontal");
  const [isExpandedOnMobile, setIsExpandedOnMobile] = useState(false);
  const previewMode = getHighlightSetting(item, "previewMode", "auto");
  const manualAspectRatio = getHighlightSetting(item, "aspectRatio", "16/9");
  const heading = getHighlightSetting(item, "heading", item?.title || "Project in Highlight");
  const highlightBody = getHighlightBody(item) || "Showcase your strongest cinematic project here.";
  const shouldShowMobileReadMore = highlightBody.length > 220;

  const hasVideo = Boolean(item?.videoUrl);
  const hasImage = Boolean(item?.posterUrl);
  const isYouTube = isYouTubeUrl(item?.videoUrl);

  const onVideoMeta = (event) => {
    const el = event.currentTarget;
    if (!el?.videoWidth || !el?.videoHeight) return;
    setMediaOrientation(el.videoHeight > el.videoWidth ? "vertical" : "horizontal");
  };

  const onImageLoad = (event) => {
    const el = event.currentTarget;
    if (!el?.naturalWidth || !el?.naturalHeight) return;
    setMediaOrientation(el.naturalHeight > el.naturalWidth ? "vertical" : "horizontal");
  };

  const orientation = previewMode === "manual" ? orientationFromAspectRatio(manualAspectRatio) : mediaOrientation;
  const previewAspectRatio = previewMode === "manual" ? manualAspectRatio : "16/9";

  const layoutStyle =
    orientation === "vertical"
      ? { gridTemplateColumns: "minmax(0,1fr) minmax(0,1.25fr)" }
      : { gridTemplateColumns: "minmax(0,2.25fr) minmax(0,.75fr)" };

  const titleSize = orientation === "vertical" ? "clamp(1.55rem,3vw,2.35rem)" : "clamp(1.25rem,2.2vw,1.75rem)";
  const copySize = orientation === "vertical" ? "clamp(1.05rem,2.2vw,1.2rem)" : "clamp(1rem,1.8vw,1.12rem)";

  return (
    <div style={{ display: "grid", gap: "1rem", ...layoutStyle }}>
      <div className="panel" style={{ overflow: "hidden" }}>
        {hasVideo && isYouTube ? (
          <iframe
            src={toYouTubeEmbedUrl(item.videoUrl)}
            title={item?.title || "Highlighted project video"}
            style={{ width: "100%", aspectRatio: previewAspectRatio, background: "rgba(8, 8, 12, 0.92)", border: 0, display: "block" }}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : hasVideo ? (
          <video
            src={item.videoUrl}
            poster={item.posterUrl || undefined}
            style={{ width: "100%", aspectRatio: previewAspectRatio, objectFit: "contain", objectPosition: "center", background: "rgba(8, 8, 12, 0.92)" }}
            autoPlay
            muted
            loop
            playsInline
            onLoadedMetadata={onVideoMeta}
          />
        ) : hasImage ? (
          <img
            src={item.posterUrl}
            alt={item?.title || "Highlighted project"}
            style={{ width: "100%", aspectRatio: previewAspectRatio, objectFit: "contain", objectPosition: "center", background: "rgba(8, 8, 12, 0.92)", display: "block" }}
            onLoad={onImageLoad}
          />
        ) : (
          <div style={{ width: "100%", aspectRatio: previewAspectRatio, background: "rgba(255,255,255,.04)" }} />
        )}
      </div>

      <div
        className="panel"
        style={{
          padding: "clamp(1.1rem,2.5vw,1.65rem)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "0.75rem"
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: titleSize,
            lineHeight: 1.1,
            textAlign: "center",
            width: "100%"
          }}
        >
          {heading}
        </h2>
        <p
          className={`highlight-showcase-body ${isExpandedOnMobile ? "is-expanded" : ""}`}
          style={{
            color: "var(--text, #f4f7fb)",
            margin: 0,
            lineHeight: 1.75,
            fontSize: copySize,
            fontWeight: 400,
            width: "100%",
            textAlign: "justify",
            textAlignLast: "center",
            hyphens: "auto",
            WebkitHyphens: "auto"
          }}
        >
          {highlightBody}
        </p>
        {shouldShowMobileReadMore ? (
          <button
            type="button"
            className="button highlight-read-more-btn"
            onClick={() => setIsExpandedOnMobile((prev) => !prev)}
            aria-expanded={isExpandedOnMobile}
          >
            {isExpandedOnMobile ? "Show less" : "Continue reading"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function normalizeTags(tags) {
  if (!tags || typeof tags !== "object" || Array.isArray(tags)) return {};
  return tags;
}

function getHighlightSetting(item, key, fallback) {
  const tags = normalizeTags(item?.tags);
  const layout = tags.highlightLayout && typeof tags.highlightLayout === "object" ? tags.highlightLayout : {};
  return layout[key] ?? fallback;
}

function orientationFromAspectRatio(ratio) {
  const [w, h] = String(ratio || "").split("/").map((v) => Number(v));
  if (!w || !h) return "horizontal";
  return h > w ? "vertical" : "horizontal";
}
