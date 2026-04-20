"use client";

import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroParallax({ hero }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();

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

      <motion.div className="container home-hero-content" style={{ y: yText, transform: `translate(${pos.x * -0.7}px, ${pos.y * -0.35}px)` }}>
        <h1>{hero?.heading || "Make your brand feel like a movie."}</h1>
        <p>{hero?.subheading || "Cinematic visuals, identity, and motion for brands that want to stand out."}</p>
        <a href="#contact" className="button">{hero?.ctaText || "Start a Project"}</a>
      </motion.div>
    </section>
  );
}
