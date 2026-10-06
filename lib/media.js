export function isYouTubeUrl(value) {
  const url = String(value || "").trim();
  if (!url) return false;
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

export function toYouTubeEmbedUrl(value) {
  const input = String(value || "").trim();
  if (!input) return "";

  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        const id = url.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }
      if (url.pathname.startsWith("/shorts/")) {
        const id = url.pathname.split("/")[2];
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }
      if (url.pathname.startsWith("/embed/")) {
        const id = url.pathname.split("/")[2];
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }
    }
  } catch {
    return "";
  }

  return "";
}

export function getYouTubeId(value) {
  const embed = toYouTubeEmbedUrl(value);
  if (!embed) return "";
  return embed.split("/embed/")[1] || "";
}

/**
 * Serve Cloudinary images resized + in a modern format (WebP/AVIF) at an
 * automatic quality. Non-Cloudinary URLs, and URLs that already carry a
 * transformation, are returned unchanged.
 *
 * Example: optimizeImageUrl(url, 800) ->
 *   https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,c_limit,w_800/v123/file.jpg
 */
export function optimizeImageUrl(value, width) {
  const url = String(value || "").trim();
  if (!url) return url;
  const match = url.match(/^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/i);
  if (!match) return url;
  const [, base, rest] = match;
  const firstSegment = rest.split("/")[0] || "";
  // Already transformed (e.g. "w_500,c_fill" or "f_auto") — leave as-is.
  if (/^[a-z]{1,3}_[^/]+$/i.test(firstSegment) && !/^v\d+$/i.test(firstSegment)) return url;
  const parts = ["f_auto", "q_auto", "c_limit"];
  if (width) parts.push(`w_${Math.round(width)}`);
  return `${base}${parts.join(",")}/${rest}`;
}

/** srcSet string for a Cloudinary image at the given widths ("" for other hosts). */
export function optimizeImageSrcSet(value, widths = [400, 800, 1200, 1600]) {
  const url = String(value || "").trim();
  if (!/^https?:\/\/res\.cloudinary\.com\//i.test(url)) return undefined;
  if (optimizeImageUrl(url, 1) === url) return undefined;
  return widths.map((w) => `${optimizeImageUrl(url, w)} ${w}w`).join(", ");
}
