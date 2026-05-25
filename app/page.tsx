import PublicHeader from "../components/PublicHeader";
import Intro from "../components/Intro";
import HeroParallax from "../components/HeroParallax";
import RevealSection from "../components/RevealSection";
import MotionHeading from "../components/MotionHeading";
import HighlightShowcase from "../components/HighlightShowcase";
import ClientsCarousel from "../components/ClientsCarousel";
import PortfolioCarousel from "../components/PortfolioCarousel";
import ContactInquiryForm from "../components/ContactInquiryForm";
import { getPublicCmsData } from "../lib/cms";
import { getPortfolioSections } from "../lib/portfolio";

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

const FALLBACK_TESTIMONIALS = [
  {
    id: "fallback-testimonial-1",
    testimonial: "Professional, passionate and phenomenal at what they do.",
    name: "Aman Verma",
    company: "Verma",
    role: "Founder",
    rating: 5,
    imageUrl: "",
    featured: false
  },
  {
    id: "fallback-testimonial-2",
    testimonial: "Cinegrafico transformed our vision into something that actually felt alive. The team gets emotion.",
    name: "Rohit Sharma",
    company: "Tata Motors",
    role: "Marketing Head",
    rating: 5,
    imageUrl: "",
    featured: true
  },
  {
    id: "fallback-testimonial-3",
    testimonial: "They brought a level of storytelling that elevated our entire campaign.",
    name: "Sneha Kapoor",
    company: "Nykaa",
    role: "Brand Director",
    rating: 5,
    imageUrl: "",
    featured: false
  }
];

function normalizeTestimonial(item) {
  const rating = Number(item?.rating ?? 5);
  return {
    id: item?.id || `${item?.name || "testimonial"}-${item?.company || "company"}`,
    name: item?.name || "Client",
    company: item?.company || "",
    role: item?.role || "",
    testimonial: item?.testimonial || item?.quote || "Testimonial coming soon.",
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, Math.round(rating))) : 5,
    imageUrl: item?.imageUrl || "",
    featured: Boolean(item?.featured)
  };
}

function getTestimonialCards(items) {
  const source = Array.isArray(items) ? items : [];
  const pool = (source.length ? source : FALLBACK_TESTIMONIALS).map(normalizeTestimonial);
  if (pool.length === 0) return { cards: [], current: 0, total: 0 };

  const featuredIndex = pool.findIndex((item) => item.featured);
  const centerIndex = featuredIndex >= 0 ? featuredIndex : Math.min(1, pool.length - 1);

  if (pool.length === 1) {
    return { cards: [{ item: pool[0], slot: 2 }], current: 1, total: 1 };
  }

  if (pool.length === 2) {
    const otherIndex = centerIndex === 0 ? 1 : 0;
    const cards = centerIndex === 0
      ? [{ item: pool[centerIndex], slot: 2 }, { item: pool[otherIndex], slot: 3 }]
      : [{ item: pool[otherIndex], slot: 1 }, { item: pool[centerIndex], slot: 2 }];
    return { cards, current: centerIndex + 1, total: pool.length };
  }

  const leftIndex = centerIndex === 0 ? 1 : centerIndex - 1;
  const rightIndex = centerIndex === pool.length - 1 ? centerIndex - 1 : centerIndex + 1;
  const fallbackLeftIndex = centerIndex === pool.length - 1 ? centerIndex - 2 : leftIndex;
  const fallbackRightIndex = centerIndex === 0 ? 2 : rightIndex;

  return {
    cards: [
      { item: pool[fallbackLeftIndex], slot: 1 },
      { item: pool[centerIndex], slot: 2 },
      { item: pool[fallbackRightIndex], slot: 3 }
    ],
    current: centerIndex + 1,
    total: pool.length
  };
}

export default async function Home() {
  const { hero, about, contact, services, portfolio, clients, testimonials } = await getPublicCmsData();
  console.log("CMS DATA →", {
    hero,
    about,
    contact,
    services,
    portfolio,
    clients,
    testimonials
  });
  const highlight = portfolio?.[0] || null;
  const portfolioSections = getPortfolioSections(portfolio);
  const testimonialDisplay = getTestimonialCards(testimonials);

  return (
    <>
      <Intro />
      <PublicHeader />
      <main className="public-page home-public-page">
        <HeroParallax hero={hero} clients={clients} />

        <RevealSection id="project-highlight">
          <div className="container">
            <div className="section-start-chip">
              <span className="section-start-label">Highlight</span>
              <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
            </div>
            <MotionHeading className="home-section-title">Project in Highlight</MotionHeading>
            <HighlightShowcase item={highlight} />
          </div>
        </RevealSection>

        <RevealSection id="services">
          <div className="container">
            <div className="section-start-chip">
              <span className="section-start-label">Services</span>
              <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
            </div>
            <MotionHeading className="home-section-title">Production and post, built for story and scale.</MotionHeading>
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
        </RevealSection>

        <RevealSection id="about">
          <div className="container">
            <div className="section-start-chip">
              <span className="section-start-label">About</span>
              <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
            </div>
            <MotionHeading className="home-section-title">Our lens, language, and creative discipline.</MotionHeading>
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
        </RevealSection>

        <section id="portfolio" className="section">
          <div className="container">
            <div className="section-start-chip">
              <span className="section-start-label">Portfolio</span>
              <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
            </div>
            <MotionHeading className="home-section-title">Recent work, cut like a reel.</MotionHeading>
            {portfolioSections.map(({ type, items }) => (
              <div key={type} className="portfolio-type-group" style={{ marginBottom: "1.75rem" }}>
                <h3
                  className="home-section-title"
                  style={{
                    fontSize: "clamp(1.15rem, 2.4vw, 1.5rem)",
                    marginBottom: ".65rem",
                    opacity: 0.92
                  }}
                >
                  {type}
                </h3>
                <PortfolioCarousel items={items} ariaLabel={`${type} — portfolio`} />
              </div>
            ))}
          </div>
        </section>

        <RevealSection id="testimonials" className="section testimonials-section">
          <div className="container testimonials-shell">
            <div className="testimonials-copy">
              <span className="testimonials-eyebrow">Testimonials</span>
              <span className="testimonials-quote-mark" aria-hidden="true">&ldquo;</span>
              <MotionHeading className="testimonials-title">Words that stay</MotionHeading>
              <p className="testimonials-kicker">Real stories. Real impact.</p>
              <p className="testimonials-lede">
                We do not just create films. We build experiences that brands and people remember.
              </p>
            </div>

            <div className="testimonials-stage" aria-label="Client testimonials">
              <div className="testimonials-nav" aria-hidden="true">
                <span className="testimonial-arrow">&lsaquo;</span>
                <span className="testimonial-arrow">&rsaquo;</span>
                <span className="testimonial-count">
                  {String(testimonialDisplay.current).padStart(2, "0")} / {String(testimonialDisplay.total).padStart(2, "0")}
                </span>
              </div>
              {testimonialDisplay.cards.map(({ item: testimonial, slot }) => (
                <article
                  key={testimonial.id}
                  className={`testimonial-card testimonial-card-${slot} ${
                    slot === 2 ? "is-featured" : ""
                  } testimonial-tone-${slot === 1 ? "studio" : slot === 3 ? "portrait" : "featured"}`}
                >
                  <span className="testimonial-stars" aria-label="5 out of 5 stars">
                    {"\u2605".repeat(testimonial.rating)}
                  </span>
                  <span className="testimonial-card-quote" aria-hidden="true">&ldquo;</span>
                  <p className="testimonial-card-copy">{testimonial.testimonial}</p>
                  <span className="testimonial-divider" />
                  <div className="testimonial-card-footer">
                    <div>
                      <h3>{testimonial.name}</h3>
                      <p>{[testimonial.role, testimonial.company].filter(Boolean).join(", ")}</p>
                    </div>
                    <span className="testimonial-brand">{testimonial.company || "Client"}</span>
                  </div>
                  <div
                    className={`testimonial-card-scene ${testimonial.imageUrl ? "has-image" : ""}`}
                    style={testimonial.imageUrl ? { backgroundImage: `url(${testimonial.imageUrl})` } : undefined}
                    aria-hidden="true"
                  >
                    <span className="testimonial-light testimonial-light-left" />
                    <span className="testimonial-light testimonial-light-right" />
                    <span className="testimonial-subject" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </RevealSection>

        <ClientsCarousel clients={clients} />

        <RevealSection id="contact">
          <div className="container">
            <div className="section-start-chip">
              <span className="section-start-label">Contact</span>
              <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
            </div>
            <div className="panel home-contact-panel">
              <div className="home-contact-top">
                <MotionHeading className="home-section-title home-contact-headline">Let us build your next cinematic story.</MotionHeading>
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
                  <ContactInquiryForm whatsappNumber={contact?.whatsapp || "+91-9839611055"} />
                </div>
              </div>
            </div>
          </div>
        </RevealSection>
      </main>
    </>
  );
}
