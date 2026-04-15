import PublicHeader from "../components/PublicHeader";
import HighlightShowcase from "../components/HighlightShowcase";
import ClientsCarousel from "../components/ClientsCarousel";
import PortfolioCarousel from "../components/PortfolioCarousel";
import { getPublicCmsData } from "../lib/cms";

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

function resolveServiceSkin(title) {
  const key = String(title || "").toLowerCase();
  if (key.includes("2d")) return "service-card-2d";
  if (key.includes("3d")) return "service-card-3d";
  if (key.includes("edit")) return "service-card-editing";
  if (key.includes("motion")) return "service-card-motion";
  if (key.includes("photo")) return "service-card-photography";
  if (key.includes("cinema")) return "service-card-cinematography";
  if (key.includes("design")) return "service-card-designing";
  return "";
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

export default async function Home() {
  const { hero, about, contact, services, portfolio, clients, teamMembers } = await getPublicCmsData();
  console.log("CMS DATA →", {
    hero,
    about,
    contact,
    services,
    portfolio,
    clients,
    teamMembers
  });
  const highlight = portfolio?.[0] || null;

  return (
    <>
      <PublicHeader />
      <main>
        <section className="section home-hero" id="hero">
          <div className="home-hero-media">
            {hero?.videoUrl ? (
              <video src={hero.videoUrl} autoPlay muted loop playsInline />
            ) : (
              <div className="home-hero-fallback" />
            )}
          </div>
          <div className="home-hero-overlay" />
          <div className="container home-hero-content">
            <div className="section-start-chip">
              <span className="section-start-label">Hero</span>
              <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
            </div>
            <h1>{hero?.heading || "Make your brand feel like a movie."}</h1>
            <p>{hero?.subheading || "Cinematic visuals, identity, and motion for brands that want to stand out."}</p>
            <a href="#contact" className="button">{hero?.ctaText || "Start a Project"}</a>
          </div>
        </section>

        <section id="project-highlight" className="section">
          <div className="container">
            <div className="section-start-chip">
              <span className="section-start-label">Highlight</span>
              <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
            </div>
            <h2 className="home-section-title">Project in Highlight</h2>
            <HighlightShowcase item={highlight} />
          </div>
        </section>

        <section id="services" className="section">
          <div className="container">
            <div className="section-start-chip">
              <span className="section-start-label">Services</span>
              <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
            </div>
            <h2 className="home-section-title">Production and post, built for story and scale.</h2>
            <div className="home-services-grid">
              {(services || []).map((service) => (
                <article
                  key={service.id}
                  className={`panel service-card ${resolveServiceSkin(service.title)}`}
                  style={{ padding: "1rem" }}
                >
                  <h3>{service.title || "Service"}</h3>
                  <p>{service.description || "Service details coming soon."}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="portfolio" className="section">
          <div className="container">
            <div className="section-start-chip">
              <span className="section-start-label">Portfolio</span>
              <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
            </div>
            <h2 className="home-section-title">Recent work, cut like a reel.</h2>
            <PortfolioCarousel items={portfolio} />
          </div>
        </section>

        <ClientsCarousel clients={clients} />

        <section id="about" className="section">
          <div className="container">
            <div className="section-start-chip">
              <span className="section-start-label">About</span>
              <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
            </div>
            <h2 className="home-section-title">Our lens, language, and creative discipline.</h2>
            <div className="home-about-grid">
              <article className="panel home-about-card">
                <h3>Vision</h3>
                <p dangerouslySetInnerHTML={{ __html: renderStyledText(about?.vision) }} />
              </article>
              <article className="panel home-about-card">
                <h3>Style</h3>
                <p dangerouslySetInnerHTML={{ __html: renderStyledText(about?.style) }} />
              </article>
              <article className="panel home-about-card">
                <h3>Trust</h3>
                <p dangerouslySetInnerHTML={{ __html: renderStyledText(about?.trust) }} />
              </article>
            </div>
          </div>
        </section>

        <section id="team" className="section">
          <div className="container">
            <div className="section-start-chip">
              <span className="section-start-label">Team</span>
              <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
            </div>
            <h2 className="home-section-title">People behind the frame.</h2>
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
        </section>

        <section id="contact" className="section">
          <div className="container">
            <div className="section-start-chip">
              <span className="section-start-label">Contact</span>
              <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
            </div>
            <div className="panel home-contact-panel">
              <div>
                <h2 className="home-section-title">Let us build your next cinematic story.</h2>
                <p className="home-contact-copy">
                  Share your brief and timeline. We will map the creative direction, production plan, and delivery flow.
                </p>
              </div>
              <div className="home-contact-actions">
                <a className="button" href={`mailto:${contact?.email || "cinegraficostudios@gmail.com"}`}>Email Us</a>
                {contact?.whatsapp ? <a className="button" href={`https://wa.me/${String(contact.whatsapp).replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a> : null}
                {contact?.phone ? <a className="button" href={`tel:${contact.phone}`}>Call</a> : null}
              </div>
              <p className="home-contact-meta">
                {contact?.email || "cinegraficostudios@gmail.com"} {contact?.location ? `• ${contact.location}` : ""}
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
