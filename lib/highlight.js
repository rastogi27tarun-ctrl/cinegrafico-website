/**
 * Long-form copy for the home Highlight block (and project detail page).
 * Prefer highlightDescription; falls back to description when unset (legacy data).
 */
export function getHighlightBody(item) {
  const tags = item?.tags;
  if (tags && typeof tags === "object" && !Array.isArray(tags)) {
    const layout = tags.highlightLayout && typeof tags.highlightLayout === "object" ? tags.highlightLayout : {};
    const longForm = typeof layout.highlightDescription === "string" ? layout.highlightDescription.trim() : "";
    if (longForm) return longForm;
  }
  return (item?.description || "").trim();
}

/**
 * Short line for portfolio cards / carousel (database `description` field).
 * Truncates when text is still long (e.g. before content is split).
 */
export function getPortfolioCardSummary(item, maxChars = 180) {
  const raw = (item?.description || "").trim();
  if (!raw) return "";
  if (raw.length <= maxChars) return raw;
  return `${raw.slice(0, maxChars).trimEnd()}…`;
}
