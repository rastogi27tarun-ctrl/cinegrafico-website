"use client";

import { useState } from "react";

export default function ContactInquiryForm({ companyEmail }) {
  const [clientEmail, setClientEmail] = useState("");
  const [project, setProject] = useState("");
  const [budget, setBudget] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const to = encodeURIComponent(companyEmail || "cinegraficostudios@gmail.com");
    const subject = encodeURIComponent("Project inquiry");
    const body = encodeURIComponent(
      `From (your email): ${clientEmail || "(not provided)"}\n\n` +
        `Project:\n${project || "(not provided)"}\n\n` +
        `Budget:\n${budget || "(not provided)"}\n`
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
    <form className="home-contact-inquiry-form" onSubmit={handleSubmit}>
      <label className="home-contact-field">
        <span className="home-contact-field-label">Your email</span>
        <input
          type="email"
          name="clientEmail"
          autoComplete="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          placeholder="you@company.com"
        />
      </label>
      <label className="home-contact-field">
        <span className="home-contact-field-label">Project</span>
        <textarea
          name="project"
          rows={4}
          value={project}
          onChange={(e) => setProject(e.target.value)}
          placeholder="Scope, timeline, deliverables…"
        />
      </label>
      <label className="home-contact-field">
        <span className="home-contact-field-label">Budget</span>
        <input
          type="text"
          name="budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Range or ballpark"
        />
      </label>
      <button type="submit" className="button home-contact-inquiry-submit">
        Inquiry
      </button>
    </form>
  );
}
