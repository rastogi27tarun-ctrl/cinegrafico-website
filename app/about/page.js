import PublicHeader from "../../components/PublicHeader";
import { getPublicCmsData } from "../../lib/cms";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderStyledText(value) {
  const safe = escapeHtml(value);
  return safe
    .replace(/\[color=(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})\](.*?)\[\/color\]/g, "<span style='color:$1'>$2</span>")
    .replace(/^# (.*)$/gm, "<strong style='font-size:1.05em'>$1</strong>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/==(.*?)==/g, "<mark style='background:rgba(255,215,0,.25);color:inherit;padding:0 .2em;border-radius:4px;'>$1</mark>")
    .replace(/\n/g, "<br/>");
}

export default async function AboutPage() {
  const { about, teamMembers } = await getPublicCmsData();
  const team = Array.isArray(teamMembers) && teamMembers.length
    ? teamMembers
    : [
        { slug: "creative-director", name: "Creative Director", subtitle: "", description: "Leads the visual language, story tone, and creative direction across campaigns." },
        { slug: "head-of-production", name: "Head of Production", subtitle: "The Architect", description: "Builds the execution blueprint from planning to delivery, ensuring quality at every stage." },
        { slug: "photographer", name: "Photographer", subtitle: "The eye", description: "Shapes light, framing, and still moments that carry cinematic depth and brand personality." },
        { slug: "manager", name: "Manager", subtitle: "The Operator", description: "Coordinates timelines, communication, and operations so projects move smoothly end-to-end." }
      ];
  const teamWithExtraSlot = [...team];
  if (teamWithExtraSlot.length < 5) {
    teamWithExtraSlot.push({
      slug: "",
      name: "New Team Member",
      subtitle: "Add from dashboard",
      description: ""
    });
  }

  return (
    <>
      <PublicHeader />
      <main className="section">
        <div className="container" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          <article className="panel" style={{ padding: "1rem" }}>
            <h2>Vision</h2>
            <p style={{ color: "var(--muted)" }} dangerouslySetInnerHTML={{ __html: renderStyledText(about?.vision) }} />
          </article>
          <article className="panel" style={{ padding: "1rem" }}>
            <h2>Style</h2>
            <p style={{ color: "var(--muted)" }} dangerouslySetInnerHTML={{ __html: renderStyledText(about?.style) }} />
          </article>
          <article className="panel" style={{ padding: "1rem" }}>
            <h2>Why clients trust us</h2>
            <p style={{ color: "var(--muted)" }} dangerouslySetInnerHTML={{ __html: renderStyledText(about?.trust) }} />
          </article>
        </div>
        <div className="container" style={{ marginTop: "1rem" }}>
          <div className="section-start-chip">
            <span className="section-start-label">Team</span>
            <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
          </div>
          <h2 style={{ marginTop: 0 }}>Team</h2>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            {teamWithExtraSlot.map((member) => (
              <article key={member.slug} className="panel team-card">
                {member.slug ? (
                  <a
                    href={`/about/team?member=${member.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="team-photo-link"
                    title={`Open ${member.name} description`}
                  >
                    {resolveTeamImage(member) ? (
                      <img src={resolveTeamImage(member)} alt={member.name || "Team member"} className="team-photo" />
                    ) : (
                      <div className="team-photo" />
                    )}
                  </a>
                ) : (
                  <div className="team-photo-link">
                    <div className="team-photo" />
                  </div>
                )}
                <div style={{ padding: "1rem" }}>
                  <p style={{ color: "var(--muted)", marginBottom: 0, minHeight: "2.4rem" }}>
                    {member.subtitle || "\u00A0"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

function resolveTeamImage(member) {
  const slug = String(member?.slug || "").toLowerCase();
  const name = String(member?.name || "").toLowerCase();
  if (slug === "creative-director") return "/assets/team-creative-director.png";
  if (slug === "head-of-production") return "/assets/team-architect.png";
  if (slug === "photographer") return "/assets/team-eye.png";
  if (slug === "manager") return "/assets/team-operator.png";
  if (name.includes("creative lead") && (name.includes("graphic") || name.includes("design"))) return "/assets/team-creative-lead-graphics.png";
  return "";
}
