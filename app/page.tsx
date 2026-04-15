"use client";

import { useEffect, useState } from "react";
import HighlightShowcase from "../components/HighlightShowcase";
import ClientsCarousel from "../components/ClientsCarousel";
import PortfolioCarousel from "../components/PortfolioCarousel";

export default function Home() {
  const [highlight, setHighlight] = useState(null);
  const [clients, setClients] = useState([]);
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    fetch("/api/cms/portfolio")
      .then(res => res.json())
      .then(data => {
        // FIRST ITEM = Highlight (as per your CMS logic)
        setHighlight(data?.[0] || null);
        setPortfolio(data || []);
      });

    fetch("/api/cms/clients")
      .then(res => res.json())
      .then(setClients);
  }, []);

  return (
    <main>
      {/* HERO / HIGHLIGHT */}
      {highlight && <HighlightShowcase item={highlight} />}

      {/* CLIENTS */}
      <ClientsCarousel items={clients} />

      {/* PORTFOLIO */}
      <PortfolioCarousel items={portfolio} />
    </main>
  );
}
