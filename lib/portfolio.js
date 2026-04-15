/** Canonical order for known project types (admin dashboard uses the same list). */
export const PORTFOLIO_PROJECT_TYPES = [
  "Photography",
  "Films",
  "Animation",
  "Motion Graphics",
  "Documentary",
  "Music Video",
  "Editing",
  "Podcast",
  "AI Video"
];

function normalizeObjectTags(tags) {
  if (!tags || typeof tags !== "object" || Array.isArray(tags)) return {};
  return tags;
}

function inferTypeFromLegacyTagArray(arr) {
  const s = arr.map((t) => String(t).toLowerCase()).join(" ");
  if (/\b(motion|identity)\b/.test(s)) return "Motion Graphics";
  if (/\b(animat|2d|3d)\b/.test(s)) return "Animation";
  if (/\b(documentary|doc)\b/.test(s)) return "Documentary";
  if (/\b(music)\b/.test(s)) return "Music Video";
  if (/\b(edit)\b/.test(s)) return "Editing";
  if (/\b(podcast)\b/.test(s)) return "Podcast";
  if (/\b(ai)\b/.test(s)) return "AI Video";
  if (/\b(photo|still)\b/.test(s)) return "Photography";
  if (/\b(film|launch|brand|corporate|festival|event|recap|product|commercial)\b/.test(s)) return "Films";
  return PORTFOLIO_PROJECT_TYPES[0];
}

/** Resolves display type for a portfolio item (explicit projectType, legacy tag array, or default). */
export function getPortfolioProjectType(item) {
  const raw = item?.tags;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const explicit = String(raw.projectType || "").trim();
    if (explicit) return explicit;
  }
  if (Array.isArray(raw) && raw.length) {
    return inferTypeFromLegacyTagArray(raw);
  }
  return PORTFOLIO_PROJECT_TYPES[0];
}

/**
 * @param {unknown[]} items
 * @returns {{ type: string, items: unknown[] }[]}
 */
export function getPortfolioSections(items) {
  const list = Array.isArray(items) ? items : [];
  const byType = new Map();
  for (const item of list) {
    const t = getPortfolioProjectType(item);
    if (!byType.has(t)) byType.set(t, []);
    byType.get(t).push(item);
  }
  const sections = [];
  for (const t of PORTFOLIO_PROJECT_TYPES) {
    const group = byType.get(t);
    if (group?.length) sections.push({ type: t, items: group });
  }
  const rest = [...byType.entries()]
    .filter(([t]) => !PORTFOLIO_PROJECT_TYPES.includes(t))
    .sort(([a], [b]) => a.localeCompare(b));
  for (const [t, group] of rest) {
    if (group.length) sections.push({ type: t, items: group });
  }
  return sections;
}
