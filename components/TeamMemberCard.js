"use client";

import { useState } from "react";

export default function TeamMemberCard({ member, imageSrc }) {
  const [open, setOpen] = useState(false);
  const subtitle = member.subtitle || "Creative Specialist";
  const name = member.name || "Team member";
  const description = member.description || "Profile description coming soon.";

  return (
    <article className={`panel team-card team-card--interactive ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="team-card-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`team-details-${member.id}`}
        aria-label={`${subtitle}${open ? ", hide" : ", show"} role and bio`}
      >
        {imageSrc ? (
          <img src={imageSrc} alt={subtitle} className="team-photo" />
        ) : (
          <div className="team-photo" aria-hidden />
        )}
        <div className="team-card-visible">
          <h2 className="team-card-subtitle-heading">{subtitle}</h2>
          <span className="team-card-hint">{open ? "Tap to close" : "Tap for role & bio"}</span>
        </div>
      </button>
      <div className="team-card-details" id={`team-details-${member.id}`} role="region" aria-label={`About ${subtitle}`}>
        <h3 className="team-card-role-title">{name}</h3>
        <p className="team-card-description">{description}</p>
      </div>
    </article>
  );
}
