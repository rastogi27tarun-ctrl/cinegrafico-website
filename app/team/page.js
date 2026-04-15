import PublicHeader from "../../components/PublicHeader";
import TeamMemberCard from "../../components/TeamMemberCard";
import { getPublicCmsData } from "../../lib/cms";

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
              <TeamMemberCard key={member.id} member={member} imageSrc={resolveTeamImage(member)} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
