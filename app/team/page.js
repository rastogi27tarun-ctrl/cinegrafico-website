import PublicHeader from "../../components/PublicHeader";
import TeamMemberCard from "../../components/TeamMemberCard";
import { getPublicCmsData } from "../../lib/cms";
import { resolveTeamImage } from "../../lib/team";

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
