"use client";

import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroParallax({ hero, clients }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const trustedClients = Array.isArray(clients) ? clients.slice(0, 7) : [];

  const yBg = useTransform(scrollY, [0, 500], [0, 150]);
  const yText = useTransform(scrollY, [0, 500], [0, -50]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.05]);

  return (
    <section
      className="section home-hero"
      id="hero"
      onMouseMove={(e) => {
        setPos({
          x: (e.clientX - window.innerWidth / 2) * 0.01,
          y: (e.clientY - window.innerHeight / 2) * 0.01
        });
      }}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
    >
      <div className="home-hero-media">
        {hero?.videoUrl ? (
          <motion.video
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2 }}
            style={{ y: yBg, scale, transform: `translate(${pos.x}px, ${pos.y}px)` }}
            src={hero.videoUrl}
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

      <motion.div className="container home-hero-shell" style={{ transform: `translate(${pos.x * -0.35}px, ${pos.y * -0.2}px)` }}>
        <div className="home-hero-orb home-hero-orb-top" aria-hidden />
        <div className="home-hero-orb home-hero-orb-main" aria-hidden />
        <motion.div className="home-hero-content" style={{ y: yText }}>
          <span className="home-hero-eyebrow">We are Cinegrafico</span>
          <h1>{hero?.heading || "Make your brand feel like a movie."}</h1>
          <p className="home-hero-kicker">Real stories. Real impact.</p>
          <p>{hero?.subheading || "Cinematic visuals, identity, and motion for brands that want to stand out."}</p>
          <a href="#portfolio" className="button home-hero-cta">{hero?.ctaText || "Watch Reel"}</a>
        </motion.div>

        <motion.div className="home-hero-frame" style={{ y: yText }}>
          {hero?.videoUrl ? (
            <video
              src={hero.videoUrl}
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
                {client.logoUrl ? <img src={client.logoUrl} alt={`${client.name || "Client"} logo`} /> : null}
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
