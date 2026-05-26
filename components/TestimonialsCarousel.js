"use client";

import { useMemo, useState } from "react";

const FALLBACK_TESTIMONIALS = [
  {
    id: "fallback-testimonial-1",
    testimonial: "Professional, passionate and phenomenal at what they do.",
    name: "Aman Verma",
    company: "Verma",
    role: "Founder",
    rating: 5,
    imageUrl: "",
    featured: false
  },
  {
    id: "fallback-testimonial-2",
    testimonial: "Cinegrafico transformed our vision into something that actually felt alive. The team gets emotion.",
    name: "Rohit Sharma",
    company: "Tata Motors",
    role: "Marketing Head",
    rating: 5,
    imageUrl: "",
    featured: true
  },
  {
    id: "fallback-testimonial-3",
    testimonial: "They brought a level of storytelling that elevated our entire campaign.",
    name: "Sneha Kapoor",
    company: "Nykaa",
    role: "Brand Director",
    rating: 5,
    imageUrl: "",
    featured: false
  }
];

function normalizeTestimonial(item) {
  const rating = Number(item?.rating ?? 5);
  return {
    id: item?.id || `${item?.name || "testimonial"}-${item?.company || "company"}`,
    name: item?.name || "Client",
    company: item?.company || "",
    role: item?.role || "",
    testimonial: item?.testimonial || item?.quote || "Testimonial coming soon.",
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, Math.round(rating))) : 5,
    imageUrl: item?.imageUrl || "",
    featured: Boolean(item?.featured)
  };
}

function getInitialIndex(items) {
  if (!items.length) return 0;
  const featuredIndex = items.findIndex((item) => item.featured);
  return featuredIndex >= 0 ? featuredIndex : Math.min(1, items.length - 1);
}

function getVisibleCards(items, activeIndex) {
  if (items.length === 0) return [];
  if (items.length === 1) return [{ item: items[0], slot: 2 }];

  const previousIndex = (activeIndex - 1 + items.length) % items.length;
  const nextIndex = (activeIndex + 1) % items.length;

  if (items.length === 2) {
    return [
      { item: items[activeIndex], slot: 2 },
      { item: items[nextIndex], slot: 3 }
    ];
  }

  return [
    { item: items[previousIndex], slot: 1 },
    { item: items[activeIndex], slot: 2 },
    { item: items[nextIndex], slot: 3 }
  ];
}

export default function TestimonialsCarousel({ testimonials }) {
  const items = useMemo(() => {
    const source = Array.isArray(testimonials) && testimonials.length ? testimonials : FALLBACK_TESTIMONIALS;
    return source.map(normalizeTestimonial);
  }, [testimonials]);
  const [activeIndex, setActiveIndex] = useState(() => getInitialIndex(items));
  const [swipeDirection, setSwipeDirection] = useState("");
  const [animationKey, setAnimationKey] = useState(0);
  const safeActiveIndex = items.length ? activeIndex % items.length : 0;
  const cards = getVisibleCards(items, safeActiveIndex);
  const canNavigate = items.length > 1;

  const showPrevious = () => {
    if (!canNavigate) return;
    setSwipeDirection("previous");
    setAnimationKey((current) => current + 1);
    setActiveIndex((current) => (current - 1 + items.length) % items.length);
  };

  const showNext = () => {
    if (!canNavigate) return;
    setSwipeDirection("next");
    setAnimationKey((current) => current + 1);
    setActiveIndex((current) => (current + 1) % items.length);
  };

  return (
    <div
      className={`testimonials-stage ${swipeDirection ? `testimonials-stage--swipe-${swipeDirection}` : ""}`}
      aria-label="Client testimonials"
    >
      <div className="testimonials-nav">
        <button
          className="testimonial-arrow"
          type="button"
          onClick={showPrevious}
          disabled={!canNavigate}
          aria-label="Show previous testimonial"
        >
          <span aria-hidden="true">&lsaquo;</span>
        </button>
        <button
          className="testimonial-arrow"
          type="button"
          onClick={showNext}
          disabled={!canNavigate}
          aria-label="Show next testimonial"
        >
          <span aria-hidden="true">&rsaquo;</span>
        </button>
        <span className="testimonial-count" aria-live="polite">
          {String(safeActiveIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
      </div>
      {cards.map(({ item: testimonial, slot }) => (
        <article
          key={slot === 2 ? `${testimonial.id}-${slot}-${animationKey}` : `${testimonial.id}-${slot}`}
          className={`testimonial-card testimonial-card-${slot} ${
            slot === 2 ? "is-featured" : ""
          } testimonial-tone-${slot === 1 ? "studio" : slot === 3 ? "portrait" : "featured"}`}
        >
          <span className="testimonial-stars" aria-label={`${testimonial.rating} out of 5 stars`}>
            {"\u2605".repeat(testimonial.rating)}
          </span>
          <span className="testimonial-card-quote" aria-hidden="true">&ldquo;</span>
          <p className="testimonial-card-copy">{testimonial.testimonial}</p>
          <span className="testimonial-divider" />
          <div className="testimonial-card-footer">
            <div>
              <h3>{testimonial.name}</h3>
              <p>{[testimonial.role, testimonial.company].filter(Boolean).join(", ")}</p>
            </div>
            <span className="testimonial-brand">{testimonial.company || "Client"}</span>
          </div>
          <div
            className={`testimonial-card-scene ${testimonial.imageUrl ? "has-image" : ""}`}
            style={testimonial.imageUrl ? { backgroundImage: `url(${testimonial.imageUrl})` } : undefined}
            aria-hidden="true"
          >
            <span className="testimonial-light testimonial-light-left" />
            <span className="testimonial-light testimonial-light-right" />
            <span className="testimonial-subject" />
          </div>
        </article>
      ))}
    </div>
  );
}
