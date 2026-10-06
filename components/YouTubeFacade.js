"use client";

import { useState } from "react";
import { getYouTubeId, toYouTubeEmbedUrl } from "../lib/media";

/**
 * Lightweight stand-in for a YouTube <iframe>.
 * Renders the video's thumbnail + a play button and only mounts the real
 * (~1 MB of JS per embed) YouTube player when the visitor clicks it.
 * Pass the same className/style you'd give the iframe so the box is identical.
 */
export default function YouTubeFacade({ url, title, className, style, autoplayOnLoad = true }) {
  const [active, setActive] = useState(false);
  const id = getYouTubeId(url);
  const embedUrl = toYouTubeEmbedUrl(url);

  if (!id || active) {
    const src = active && autoplayOnLoad ? `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1` : embedUrl;
    return (
      <iframe
        src={src}
        title={title || "YouTube video"}
        className={className}
        style={style}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className={`yt-facade ${className || ""}`}
      style={style}
      onClick={() => setActive(true)}
      aria-label={`Play video: ${title || "YouTube video"}`}
    >
      <img
        className="yt-facade-thumb"
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        width={480}
        height={360}
        loading="lazy"
        decoding="async"
      />
      <span className="yt-facade-play" aria-hidden="true">
        <svg viewBox="0 0 68 48" width="68" height="48">
          <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#f00" />
          <path d="M45 24 27 14v20" fill="#fff" />
        </svg>
      </span>
    </button>
  );
}
