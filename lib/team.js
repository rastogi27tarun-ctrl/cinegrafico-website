/** Prefer CMS photo URL; fall back to legacy slug/name → asset mapping. */
export function resolveTeamImage(member) {
  if (!member || typeof member !== "object") return "";
  const custom = String(member.photoUrl || "").trim();
  if (custom) return custom;
  const slug = String(member.slug || "").toLowerCase();
  const name = String(member.name || "").toLowerCase();
  if (slug === "creative-director") return "/assets/team-creative-director.png";
  if (slug === "head-of-production") return "/assets/team-architect.png";
  if (slug === "photographer") return "/assets/team-eye.png";
  if (slug === "cinematographer") return "/assets/team-lens.png";
  if (slug === "manager") return "/assets/team-operator.png";
  if (name.includes("creative lead") && (name.includes("graphic") || name.includes("design"))) {
    return "/assets/team-creative-lead-graphics.png";
  }
  return "";
}
