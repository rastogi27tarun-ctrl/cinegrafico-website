"use client";

import { useState } from "react";
import {
  DEFAULT_INQUIRY_WHATSAPP,
  buildInquiryWhatsAppMessage,
  buildWhatsAppUrl,
  whatsappDigits
} from "../lib/whatsapp";

export default function ContactInquiryForm({ whatsappNumber = DEFAULT_INQUIRY_WHATSAPP }) {
  const [clientEmail, setClientEmail] = useState("");
  const [project, setProject] = useState("");
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const waDigits = whatsappDigits(whatsappNumber) || DEFAULT_INQUIRY_WHATSAPP;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setSubmitting(true);

    const payload = {
      email: clientEmail.trim(),
      project: project.trim(),
      budget: budget.trim()
    };

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus(data.error || "Could not send your inquiry. Please try again.");
        return;
      }

      const openWhatsApp = window.confirm(
        "Your inquiry has been saved.\n\nWould you like to continue the conversation on WhatsApp?"
      );

      if (openWhatsApp) {
        const message = buildInquiryWhatsAppMessage(payload);
        window.open(buildWhatsAppUrl(waDigits, message), "_blank", "noopener,noreferrer");
      }

      setStatus(
        openWhatsApp
          ? "Thanks — we opened WhatsApp with your inquiry details."
          : "Thanks — we received your inquiry and will be in touch soon."
      );
      setClientEmail("");
      setProject("");
      setBudget("");
    } catch {
      setStatus("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="home-contact-inquiry-form" onSubmit={handleSubmit}>
      <label className="home-contact-field">
        <span className="home-contact-field-label">Your email</span>
        <input
          type="email"
          name="clientEmail"
          autoComplete="email"
          required
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          placeholder="you@company.com"
          disabled={submitting}
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
          disabled={submitting}
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
          disabled={submitting}
        />
      </label>
      {status ? (
        <p className="home-contact-inquiry-status" role="status">
          {status}
        </p>
      ) : null}
      <button type="submit" className="button home-contact-inquiry-submit" disabled={submitting}>
        {submitting ? "Sending…" : "Inquiry"}
      </button>
    </form>
  );
}
