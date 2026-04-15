import PublicHeader from "../../components/PublicHeader";
import { getPublicCmsData } from "../../lib/cms";

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

export default async function TeamPage() {
  const { teamMembers } = await getPublicCmsData();

  return (
    <>
      <PublicHeader />
      <main className="section">
        <div className="container">
          <div className="section-start-chip">
            <span className="section-start-label">Team</span>
            <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
          </div>
          <h1 className="home-section-title">People behind the frame.</h1>
          <div className="home-team-grid">
            {(teamMembers || []).map((member) => (
              <article key={member.id} className="panel team-card">
                {resolveTeamImage(member) ? (
                  <img src={resolveTeamImage(member)} alt={member.name || "Team member"} className="team-photo" />
                ) : (
                  <div className="team-photo" />
                )}
                <div className="home-team-copy">
                  <h3>{member.name || "Team member"}</h3>
                  <p className="home-team-subtitle">{member.subtitle || "Creative Specialist"}</p>
                  <p>{member.description || "Profile description coming soon."}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
