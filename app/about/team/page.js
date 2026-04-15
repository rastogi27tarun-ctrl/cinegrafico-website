import PublicHeader from "../../../components/PublicHeader";
import { getContent } from "../../../lib/cms";

const TEAM_CONTENT = {
  "creative-director": {
    name: "Creative Director",
    image: "/assets/team-creative-director.png",
    description: "Leads the visual language, story tone, and creative direction across campaigns."
  },
  "head-of-production": {
    name: "Head of Production",
    image: "/assets/team-architect.png",
    description: "Builds the execution blueprint from planning to delivery, ensuring quality at every stage."
  },
  photographer: {
    name: "Photographer",
    image: "/assets/team-eye.png",
    description: "Shapes light, framing, and still moments that carry cinematic depth and brand personality."
  },
  cinematographer: {
    name: "Cinematographer",
    image: "/assets/team-lens.png",
    description: "Designs camera movement and lighting to shape mood, emotion, and visual impact."
  },
  manager: {
    name: "Manager",
    image: "/assets/team-operator.png",
    description: "Coordinates timelines, communication, and operations so projects move smoothly end-to-end."
  }
};

export default async function TeamMemberPage({ searchParams }) {
  const params = await searchParams;
  const { teamMembers } = await getContent();
  const dbMember = (teamMembers || []).find((m) => m.slug === params?.member);
  const fallback = TEAM_CONTENT[params?.member] || {
    name: "Team Member",
    image: "",
    description: "Select a team member from the About page to view detailed description."
  };
  const member = dbMember
    ? {
        name: dbMember.name || fallback.name,
        image: resolveTeamImage(dbMember) || fallback.image,
        description: dbMember.description || fallback.description
      }
    : fallback;

  return (
    <>
      <PublicHeader />
      <main className="section">
        <div className="container">
          <div className="section-start-chip">
            <span className="section-start-label">Team</span>
            <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
          </div>
          <article className="panel" style={{ padding: "1.1rem", maxWidth: "760px" }}>
            {member.image ? (
              <img
                src={member.image}
                alt={member.name}
                style={{
                  width: "min(320px, 100%)",
                  aspectRatio: "4/5",
                  objectFit: "cover",
                  display: "block",
                  margin: "0 auto 1rem",
                  borderRadius: "14px"
                }}
              />
            ) : null}
            <h1 style={{ marginTop: 0 }}>{member.name}</h1>
            <p style={{ color: "var(--muted)", marginBottom: 0, lineHeight: 1.7 }}>{member.description}</p>
          </article>
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
  if (slug === "cinematographer") return "/assets/team-lens.png";
  if (slug === "manager") return "/assets/team-operator.png";
  if (name.includes("creative lead") && (name.includes("graphic") || name.includes("design"))) return "/assets/team-creative-lead-graphics.png";
  return "";
}
