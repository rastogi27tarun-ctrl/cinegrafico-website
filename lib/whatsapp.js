/** Digits only for wa.me links (e.g. +91-9839611055 → 919839611055). */
export function whatsappDigits(phone) {
  return String(phone ?? "").replace(/\D/g, "");
}

export const DEFAULT_INQUIRY_WHATSAPP = "919839611055";

export function buildWhatsAppUrl(phoneDigits, message) {
  const digits = whatsappDigits(phoneDigits) || DEFAULT_INQUIRY_WHATSAPP;
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}

export function buildInquiryWhatsAppMessage({ email, project, budget }) {
  return [
    "Hi, I'd like to discuss a project inquiry.",
    "",
    `Email: ${email}`,
    `Project: ${project || "(not provided)"}`,
    `Budget: ${budget || "(not provided)"}`
  ].join("\n");
}
