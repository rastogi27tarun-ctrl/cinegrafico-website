"use client";

import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { optimizeImageUrl } from "../lib/media";

// Poster frame for the bundled hero video so something paints immediately
// (only used when the CMS hero video is the default bundled asset).
const DEFAULT_HERO_VIDEO = "/assets/hero-backdrop.mp4";
const DEFAULT_HERO_POSTER = "/assets/hero-backdrop-poster.webp";

export default function HeroParallax({ hero, clients }) {
  // Mouse parallax is driven by motion values instead of React state so
  // mouse movement no longer re-renders the whole hero on every mousemove.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const { scrollY } = useScroll();
  const trustedClients = Array.isArray(clients) ? clients.slice(0, 7) : [];

  const yBg = useTransform(scrollY, [0, 500], [0, 150]);
  const yText = useTransform(scrollY, [0, 500], [0, -50]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.05]);
  const bgY = useTransform([yBg, mouseY], ([scrollOffset, mouse]) => scrollOffset + mouse);
  const shellX = useTransform(mouseX, (v) => v * -0.35);
  const shellY = useTransform(mouseY, (v) => v * -0.2);
  const heroPoster = hero?.videoUrl === DEFAULT_HERO_VIDEO ? DEFAULT_HERO_POSTER : undefined;

  return (
    <section
      className="section home-hero"
      id="hero"
      onMouseMove={(e) => {
        mouseX.set((e.clientX - window.innerWidth / 2) * 0.01);
        mouseY.set((e.clientY - window.innerHeight / 2) * 0.01);
      }}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
    >
      <div className="home-hero-media">
        {hero?.videoUrl ? (
          <motion.video
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2 }}
            style={{ x: mouseX, y: bgY, scale }}
            src={hero.videoUrl}
            poster={heroPoster}
            preload="auto"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <div className="home-hero-fallback" />
        )}
      </div>

      <div className="home-hero-overlay" />
      <div className="smoke" />

      <motion.div className="container home-hero-shell" style={{ x: shellX, y: shellY }}>
        <div className="home-hero-orb home-hero-orb-top" aria-hidden />
        <div className="home-hero-orb home-hero-orb-main" aria-hidden />
        <motion.div className="home-hero-content" style={{ y: yText }}>
          <span className="home-hero-eyebrow">We are Cinegrafico</span>
          <h1>{hero?.heading || "Make your brand feel like a movie."}</h1>
          <p className="home-hero-kicker">Real stories. Real impact.</p>
          <p>{hero?.subheading || "Cinematic visuals, identity, and motion for brands that want to stand out."}</p>
          <a href="#contact" className="button home-hero-cta">{hero?.ctaText || "Watch Reel"}</a>
        </motion.div>

        <motion.div className="home-hero-frame" style={{ y: yText }}>
          {hero?.videoUrl ? (
            <video
              src={hero.videoUrl}
              poster={heroPoster}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <div className="home-hero-frame-fallback" />
          )}
        </motion.div>

        <div className="home-hero-trust-strip" aria-label="Trusted by clients">
          <span className="home-hero-trust-label">Trusted by</span>
          <div className="home-hero-trust-logos">
            {trustedClients.length ? trustedClients.map((client) => (
              <span key={client.id || client.name} className="home-hero-trust-item">
                {client.logoUrl ? (
                  <img
                    src={optimizeImageUrl(client.logoUrl, 240)}
                    alt={`${client.name || "Client"} logo`}
                    decoding="async"
                  />
                ) : null}
                <span>{client.name || "Brand"}</span>
              </span>
            )) : (
              ["Tata Motors", "Nykaa", "Zomato", "Boat", "Slice", "Cred"].map((name) => (
                <span key={name} className="home-hero-trust-item"><span>{name}</span></span>
              ))
            )}
          </div>
        </div>

        <a href="#clients" className="home-hero-scroll-cue">
          Scroll <span aria-hidden>+</span>
        </a>
      </motion.div>
    </section>
  );
}
