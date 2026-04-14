"use client";

import { useState } from "react";
import { isYouTubeUrl, toYouTubeEmbedUrl } from "@/lib/media";

export default function HighlightShowcase({ item }) {
  const [mediaOrientation, setMediaOrientation] = useState("horizontal");
  const previewMode = getHighlightSetting(item, "previewMode", "auto");
  const manualAspectRatio = getHighlightSetting(item, "aspectRatio", "16/9");

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

  const titleSize = orientation === "vertical" ? "clamp(1.45rem,2.8vw,2.15rem)" : "clamp(1.15rem,2vw,1.55rem)";
  const copySize = orientation === "vertical" ? "1rem" : ".92rem";

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

      <div className="panel" style={{ padding: "1rem", display: "grid", alignContent: "center" }}>
        <h2 style={{ marginTop: 0, marginBottom: ".4rem", fontSize: titleSize, lineHeight: 1.1 }}>
          {item?.title || "Project in Highlight"}
        </h2>
        <p style={{ color: "var(--muted)", margin: 0, lineHeight: 1.7, fontSize: copySize }}>
          {item?.description || "Showcase your strongest cinematic project here."}
        </p>
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
