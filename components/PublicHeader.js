 "use client";

import { useEffect, useState } from "react";

const SECTION_LINKS = [
  { id: "project-highlight", label: "Project in Highlight" },
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Portfolio" },
  { id: "clients", label: "Clients" },
  { id: "contact", label: "Contact" }
];

export default function PublicHeader() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const fromHash = window.location.hash?.replace("#", "");
    if (fromHash) setActiveId(fromHash);

    const getSections = () =>
      SECTION_LINKS.map((item) => document.getElementById(item.id)).filter(Boolean);

    const updateActiveByScroll = () => {
      const sections = getSections();
      if (!sections.length) return;
      const viewportAnchor = window.innerHeight * 0.36;

      let bestId = sections[0].id;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        const sectionMid = rect.top + rect.height / 2;
        const distance = Math.abs(sectionMid - viewportAnchor);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestId = section.id;
        }
      }
      setActiveId(bestId);
    };

    updateActiveByScroll();
    window.addEventListener("scroll", updateActiveByScroll, { passive: true });
    window.addEventListener("resize", updateActiveByScroll);
    return () => {
      window.removeEventListener("scroll", updateActiveByScroll);
      window.removeEventListener("resize", updateActiveByScroll);
    };
  }, []);

  return (
    <header style={{ position: "sticky", top: 0, backdropFilter: "blur(14px)", borderBottom: "1px solid var(--line)", zIndex: 10 }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: ".6rem", fontWeight: 700 }}>
          <img src="/assets/cinegrafico-logo.png" alt="logo" style={{ height: "2.2rem" }} />
          Cinegrafico Studios
        </a>
        <nav style={{ display: "flex", gap: "1rem", color: "var(--muted)", flexWrap: "wrap" }}>
          {SECTION_LINKS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`/#${item.id}`}
                className={`main-tab-link ${isActive ? "is-active" : ""}`}
                onClick={() => setActiveId(item.id)}
              >
                <span>{item.label}</span>
                <span className={`main-tab-dot-wrap ${isActive ? "is-active" : ""}`}>
                  <span className={`main-tab-dot ${isActive ? "is-active" : ""}`} />
                </span>
              </a>
            );
          })}
          <a href="/about">About</a>
        </nav>
      </div>
    </header>
  );
}
