 "use client";

import { useEffect, useState } from "react";

const SECTION_LINKS = [
  { id: "project-highlight", label: "Project in Highlight" },
  { id: "services", label: "Services" },
  { id: "about", label: "About" },
  { id: "portfolio", label: "Portfolio" },
  { id: "clients", label: "Clients" },
  { id: "contact", label: "Contact" }
];

export default function PublicHeader() {
  const [activeId, setActiveId] = useState("");
  const [pathname, setPathname] = useState("/");

  const [hiringNavVisible, setHiringNavVisible] = useState(false);

  useEffect(() => {
    fetch("/api/cms/hiring")
      .then((r) => r.json())
      .then((data) => setHiringNavVisible(Boolean(data?.isVisible)))
      .catch(() => setHiringNavVisible(false));
  }, []);

  useEffect(() => {
    const fromHash = window.location.hash?.replace("#", "");
    if (fromHash) setActiveId(fromHash);
    setPathname(window.location.pathname || "/");

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
    const updatePathname = () => setPathname(window.location.pathname || "/");

    updateActiveByScroll();
    updatePathname();
    window.addEventListener("scroll", updateActiveByScroll, { passive: true });
    window.addEventListener("resize", updateActiveByScroll);
    window.addEventListener("hashchange", updateActiveByScroll);
    window.addEventListener("popstate", updatePathname);
    return () => {
      window.removeEventListener("scroll", updateActiveByScroll);
      window.removeEventListener("resize", updateActiveByScroll);
      window.removeEventListener("hashchange", updateActiveByScroll);
      window.removeEventListener("popstate", updatePathname);
    };
  }, []);

  return (
    <header className="public-header">
      <div className="container public-header-inner">
        <a href="/" className="public-header-brand">
          <img src="/assets/cinegrafico-logo.png" alt="logo" className="public-header-logo" />
          Cinegrafico Studios
        </a>
        <nav className="public-header-nav">
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
          <a href="/team" className={`main-tab-link ${pathname.startsWith("/team") ? "is-active" : ""}`}>
            <span>Team</span>
            <span className={`main-tab-dot-wrap ${pathname.startsWith("/team") ? "is-active" : ""}`}>
              <span className={`main-tab-dot ${pathname.startsWith("/team") ? "is-active" : ""}`} />
            </span>
          </a>
          {hiringNavVisible ? (
            <a href="/hiring" className={`main-tab-link ${pathname.startsWith("/hiring") ? "is-active" : ""}`}>
              <span>Hiring</span>
              <span className={`main-tab-dot-wrap ${pathname.startsWith("/hiring") ? "is-active" : ""}`}>
                <span className={`main-tab-dot ${pathname.startsWith("/hiring") ? "is-active" : ""}`} />
              </span>
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
