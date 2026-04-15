import PublicHeader from "../components/PublicHeader";
import HighlightShowcase from "../components/HighlightShowcase";
import ClientsCarousel from "../components/ClientsCarousel";
import PortfolioCarousel from "../components/PortfolioCarousel";
import ContactInquiryForm from "../components/ContactInquiryForm";
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

export default async function Home() {
  const { hero, about, contact, services, portfolio, clients } = await getPublicCmsData();
  console.log("CMS DATA →", {
    hero,
    about,
    contact,
    services,
    portfolio,
    clients
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
              {(services || []).map((service, index) => (
                <article
                  key={service.id}
                  className={`panel service-card ${resolveServiceSkin(service.title)}`}
                  style={{ padding: "1rem" }}
                >
                  <span className="service-card-index">{index + 1}</span>
                  <h3>{service.title || "Service"}</h3>
                  <p>{service.description || "Service details coming soon."}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div className="container">
            <div className="section-start-chip">
              <span className="section-start-label">About</span>
              <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
            </div>
            <h2 className="home-section-title">Our lens, language, and creative discipline.</h2>
            <div className="home-about-intro">
              <p>
                At Cinegrafico Studios, our team&apos;s expertise in visual storytelling through motion graphics and film production shapes captivating narratives that resonate with audiences globally. My role as a founder and motion graphic designer builds on a foundation of commercial photography and visual design to create compelling content that fosters deep connections.
              </p>
              <p>
                With our recent work, we&apos;ve embraced the challenge of translating spiritual journeys into visual experiences, honoring the sacred and provoking thought. Collaborating with a diverse team, we strive to craft art that not only reflects beauty but also ignites the spirit of adventure and exploration, touching on the profound relationship between humanity and Earth.
              </p>
            </div>
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

        <section id="contact" className="section">
          <div className="container">
            <div className="section-start-chip">
              <span className="section-start-label">Contact</span>
              <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
            </div>
            <div className="panel home-contact-panel">
              <div className="home-contact-top">
                <h2 className="home-section-title home-contact-headline">Let us build your next cinematic story.</h2>
                <p className="home-contact-lede">
                  Share your brief and timeline. We will map the creative direction, production plan, and delivery flow.
                </p>
              </div>
              <div className="home-contact-row">
                <div className="home-contact-company-box">
                  <dl className="home-contact-company-list">
                    <div className="home-contact-company-item">
                      <dt>Email</dt>
                      <dd>
                        <a href={`mailto:${contact?.email || "cinegraficostudios@gmail.com"}`}>
                          {contact?.email || "cinegraficostudios@gmail.com"}
                        </a>
                      </dd>
                    </div>
                    {contact?.whatsapp ? (
                      <div className="home-contact-company-item">
                        <dt>WhatsApp</dt>
                        <dd>
                          <a href={`https://wa.me/${String(contact.whatsapp).replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer">
                            {contact.whatsapp}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                    {contact?.phone ? (
                      <div className="home-contact-company-item">
                        <dt>Call</dt>
                        <dd>
                          <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  <p className="home-contact-availability">Available for Q2 and Q3 projects</p>
                  {contact?.location ? (
                    <p className="home-contact-location">
                      <span className="home-contact-location-label">Location</span>
                      {contact.location}
                    </p>
                  ) : null}
                </div>
                <div className="home-contact-inquiry-box">
                  <h3 className="home-contact-inquiry-title">Send an inquiry</h3>
                  <ContactInquiryForm companyEmail={contact?.email || "cinegraficostudios@gmail.com"} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
