"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function ClientsCarousel({ clients }) {
  const trackRef = useRef(null);
  const [centerIndex, setCenterIndex] = useState(0);
  const [failedLogoIds, setFailedLogoIds] = useState({});

  const slides = useMemo(() => {
    const base = Array.isArray(clients) ? clients : [];
    if (!base.length) return [];
    return [...base, ...base.slice(0, Math.min(3, base.length))];
  }, [clients]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !slides.length) return;

    let autoTimer = null;
    let paused = false;

    const cards = () => Array.from(track.querySelectorAll(".client-slide"));

    const updateCenter = () => {
      const trackRect = track.getBoundingClientRect();
      const centerX = trackRect.left + trackRect.width / 2;
      const allCards = cards();
      if (!allCards.length) return;

      let closest = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      for (let i = 0; i < allCards.length; i += 1) {
        const rect = allCards[i].getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(centerX - cardCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closest = i;
        }
      }
      setCenterIndex(closest);
    };

    const step = () => {
      if (paused) return;
      const allCards = cards();
      if (!allCards.length) return;
      const first = allCards[0];
      const gap = parseFloat(getComputedStyle(track).gap || "0") || 0;
      const stepSize = first.getBoundingClientRect().width + gap;
      const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
      const nextScrollLeft = track.scrollLeft + stepSize;

      if (nextScrollLeft >= maxScrollLeft - 2) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollTo({ left: nextScrollLeft, behavior: "smooth" });
      }
    };

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };

    updateCenter();
    track.addEventListener("scroll", updateCenter, { passive: true });
    window.addEventListener("resize", updateCenter);
    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", resume);
    track.addEventListener("focusin", pause);
    track.addEventListener("focusout", resume);
    track.addEventListener("pointerdown", pause);
    track.addEventListener("pointerup", resume);

    autoTimer = window.setInterval(step, 2300);

    return () => {
      window.clearInterval(autoTimer);
      track.removeEventListener("scroll", updateCenter);
      window.removeEventListener("resize", updateCenter);
      track.removeEventListener("mouseenter", pause);
      track.removeEventListener("mouseleave", resume);
      track.removeEventListener("focusin", pause);
      track.removeEventListener("focusout", resume);
      track.removeEventListener("pointerdown", pause);
      track.removeEventListener("pointerup", resume);
    };
  }, [slides.length]);

  return (
    <section id="clients" className="section">
      <div className="container">
        <div className="clients-copy">
          <div>
            <div className="section-start-chip">
              <span className="section-start-label">Clients</span>
              <span className="section-start-dot-wrap"><span className="section-start-dot" /></span>
            </div>
            <h2 className="clients-heading">Trusted by brands that value cinematic quality.</h2>
          </div>
          <p className="clients-subcopy">
            Scroll through our partners. The centered client stays in focus to create a premium, story-led carousel
            experience.
          </p>
        </div>

        <div ref={trackRef} className="clients-carousel" aria-label="Clients carousel">
          {slides.map((c, i) => {
            const highlighted = i === centerIndex;
            const name = c?.name || "Brand";
            const logoKey = `${c?.id || "client"}-${i}`;
            const showLogo = Boolean(c?.logoUrl) && !failedLogoIds[logoKey];
            return (
              <article key={`${c.id}-${i}`} className={`client-slide ${highlighted ? "is-center" : ""}`}>
                {showLogo ? (
                  <img
                    src={c.logoUrl}
                    alt={`${name} logo`}
                    className="client-slide-logo"
                    onError={() => {
                      setFailedLogoIds((prev) => ({ ...prev, [logoKey]: true }));
                    }}
                  />
                ) : (
                  <div className="client-slide-fallback">{name.slice(0, 2).toUpperCase()}</div>
                )}
                <span className="client-slide-name">{name}</span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
