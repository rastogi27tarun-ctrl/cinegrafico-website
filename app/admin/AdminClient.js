"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSortableList from "../../components/AdminSortableList";
import {
  PORTFOLIO_PROJECT_TYPES as PROJECT_TYPES,
  getPortfolioProjectType,
  getPortfolioSections,
  mergePortfolioSectionOrder
} from "../../lib/portfolio";

const NAV_SECTIONS = [
  {
    label: "Home",
    items: [
      { id: "Hero", label: "Banner & video" },
      { id: "Highlight", label: "Project highlight" }
    ]
  },
  {
    label: "Work",
    items: [
      { id: "Services", label: "Services" },
      { id: "Portfolio", label: "Portfolio" },
      { id: "Clients", label: "Clients" },
      { id: "Testimonials", label: "Testimonials" }
    ]
  },
  {
    label: "About",
    items: [
      { id: "About", label: "About" },
      { id: "Team", label: "Team" },
      { id: "Hiring", label: "Hiring" }
    ]
  },
  {
    label: "Contact",
    items: [{ id: "Contact", label: "Contact" }]
  }
];

function getTabLabel(tabId) {
  for (const g of NAV_SECTIONS) {
    const item = g.items.find((i) => i.id === tabId);
    if (item) return item.label;
  }
  return tabId;
}

export default function AdminClient() {
  const [tab, setTab] = useState("Hero");
  const [status, setStatus] = useState("");

  const [hero, setHero] = useState({ heading: "", subheading: "", ctaText: "", videoUrl: "" });
  const [about, setAbout] = useState({ vision: "", style: "", trust: "" });
  const [contact, setContact] = useState({ email: "", phone: "", whatsapp: "", location: "" });
  const [inquiries, setInquiries] = useState([]);
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [clients, setClients] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [team, setTeam] = useState([]);
  const [newPortfolioTitle, setNewPortfolioTitle] = useState("");
  const [newPortfolioDescription, setNewPortfolioDescription] = useState("");
  const [newPortfolioType, setNewPortfolioType] = useState(PROJECT_TYPES[0]);
  const [hiring, setHiring] = useState({
    isVisible: false,
    roleTitle: "",
    profileDescription: "",
    whoCanApply: "",
    applyButtonLabel: "Apply",
    applyUrl: ""
  });

  const loadAll = async () => {
    const fetchJson = async (url) => {
      try {
        const r = await fetch(url);
        return await r.json();
      } catch {
        return null;
      }
    };
    const [h, a, c, hi, s, p, cl, te, tm, inq] = await Promise.all([
      fetchJson("/api/cms/hero"),
      fetchJson("/api/cms/about"),
      fetchJson("/api/cms/contact"),
      fetchJson("/api/cms/hiring"),
      fetchJson("/api/cms/services"),
      fetchJson("/api/cms/portfolio"),
      fetchJson("/api/cms/clients"),
      fetchJson("/api/cms/testimonials"),
      fetchJson("/api/cms/team"),
      fetchJson("/api/cms/inquiries")
    ]);
    setHero(h || {});
    setAbout(a || {});
    setContact(c || {});
    setHiring((prev) => {
      if (!hi || typeof hi !== "object") {
        return prev;
      }
      return {
        isVisible: Boolean(hi.isVisible),
        roleTitle: hi.roleTitle ?? "",
        profileDescription: hi.profileDescription ?? "",
        whoCanApply: hi.whoCanApply ?? "",
        applyButtonLabel: (hi.applyButtonLabel && String(hi.applyButtonLabel).trim()) || "Apply",
        applyUrl: hi.applyUrl ?? ""
      };
    });
    setServices(Array.isArray(s) ? s : []);
    setPortfolio(Array.isArray(p) ? p : []);
    setClients(Array.isArray(cl) ? cl : []);
    setTestimonials(Array.isArray(te) ? te : []);
    setTeam(Array.isArray(tm) ? tm : []);
    setInquiries(Array.isArray(inq) ? inq : []);
  };

  useEffect(() => { loadAll(); }, []);

  const uploadFile = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload?.error || "Upload failed");
    return payload.url;
  };

  const safeUploadFile = async (file, label) => {
    try {
      return await uploadFile(file);
    } catch (error) {
      setStatus(`${label} upload failed: ${error?.message || "Unknown error"}`);
      return "";
    }
  };

  const persistListOrder = async (resource, items, setItems, successMessage = "Order saved") => {
    const ids = items.map((item) => item.id);
    const result = await requestJson(`/api/cms/${resource}/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids })
    }, successMessage);
    if (result.ok) {
      setItems(items.map((item, position) => ({ ...item, position })));
    }
    return result;
  };

  const requestJson = async (url, options, successMessage = "", reloadAfter = false) => {
    const res = await fetch(url, options);
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errMsg =
        typeof payload?.error === "string"
          ? payload.error
          : payload?.message || `Request failed (${res.status})`;
      setStatus(errMsg);
      return { ok: false, payload };
    }
    if (reloadAfter) await loadAll();
    if (successMessage) setStatus(successMessage);
    return { ok: true, payload };
  };

  const sectionForm = useMemo(() => {
    if (tab === "Hero") {
      return (
        <form onSubmit={async (e) => {
          e.preventDefault();
          await requestJson(
            "/api/cms/hero",
            { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(hero) },
            "Hero saved"
          );
        }}>
          <Field label="Heading" value={hero.heading || ""} onChange={(v) => setHero({ ...hero, heading: v })} />
          <Field label="Subheading" value={hero.subheading || ""} onChange={(v) => setHero({ ...hero, subheading: v })} textarea />
          <Field label="CTA Text" value={hero.ctaText || ""} onChange={(v) => setHero({ ...hero, ctaText: v })} />
          <Field label="Video URL" value={hero.videoUrl || ""} onChange={(v) => setHero({ ...hero, videoUrl: v })} />
          <div style={{ marginBottom: ".65rem" }}>
            <label>Upload Hero Video (local disk)</label>
            <input
              type="file"
              accept="video/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const videoUrl = await safeUploadFile(file, "Hero video");
                if (!videoUrl) return;
                setHero({ ...hero, videoUrl });
                setStatus("Hero video uploaded. Click Save Hero to publish.");
              }}
            />
          </div>
          <button className="button">Save Hero</button>
        </form>
      );
    }

    if (tab === "About") {
      return (
        <form onSubmit={async (e) => {
          e.preventDefault();
          await requestJson(
            "/api/cms/about",
            { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(about) },
            "About saved"
          );
        }}>
          <StylizedTextarea label="Vision" value={about.vision || ""} onChange={(v) => setAbout({ ...about, vision: v })} />
          <StylizedTextarea label="Style" value={about.style || ""} onChange={(v) => setAbout({ ...about, style: v })} />
          <StylizedTextarea label="Trust" value={about.trust || ""} onChange={(v) => setAbout({ ...about, trust: v })} />
          <button className="button">Save About</button>
        </form>
      );
    }

    if (tab === "Highlight") {
      const highlighted = portfolio[0] || { id: "", title: "", description: "", videoUrl: "", posterUrl: "", tags: {} };
      const previewMode = getHighlightSetting(highlighted, "previewMode", "auto");
      const aspectRatio = getHighlightSetting(highlighted, "aspectRatio", "16/9");
      return (
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!highlighted.id) {
            const created = await requestJson("/api/cms/portfolio", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: highlighted.title || "Project in Highlight",
                description: highlighted.description || "",
                videoUrl: highlighted.videoUrl || "",
                posterUrl: highlighted.posterUrl || "",
                tags: normalizeTags(highlighted.tags),
                position: 0
              })
            });
            if (!created.ok) return;
            await loadAll();
            setStatus("Highlight project created");
            return;
          }

          const saved = await requestJson(`/api/cms/portfolio/${highlighted.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(highlighted)
          });
          if (!saved.ok) return;
          await loadAll();
          setStatus("Highlight project saved");
        }}>
          <Field
            label="Highlight Title"
            value={getHighlightSetting(highlighted, "heading", highlighted.title || "")}
            onChange={(v) => {
              const next = withHighlightSetting(highlighted, "heading", v);
              if (!portfolio.length) {
                setPortfolio([{ id: "", title: "", description: "", videoUrl: "", posterUrl: "", tags: next.tags }]);
                return;
              }
              setPortfolio(portfolio.map((p, i) => (i === 0 ? next : p)));
            }}
          />
          <p style={{ margin: "0 0 .5rem", fontSize: ".85rem", color: "var(--muted, #888)" }}>
            <strong>Full story</strong> for the home Highlight (large on the site). A <strong>short</strong> line for
            cards and carousel is edited under <strong>Portfolio</strong> (same item, first in the list).
          </p>
          <Field
            label="Highlight description (home — full story)"
            value={getHighlightSetting(highlighted, "highlightDescription", "")}
            onChange={(v) => {
              const next = withHighlightSetting(highlighted, "highlightDescription", v);
              if (!portfolio.length) {
                setPortfolio([{ id: "", title: "", description: "", videoUrl: "", posterUrl: "", tags: next.tags }]);
                return;
              }
              setPortfolio(portfolio.map((p, i) => (i === 0 ? next : p)));
            }}
            textarea
            rows={12}
          />
          <Field
            label="Highlight Video URL"
            value={highlighted.videoUrl || ""}
            onChange={(v) => {
              if (!portfolio.length) {
                setPortfolio([{ id: "", title: "", description: "", videoUrl: v, posterUrl: "", tags: {} }]);
                return;
              }
              setPortfolio(portfolio.map((p, i) => (i === 0 ? { ...p, videoUrl: v } : p)));
            }}
          />
          <div style={{ marginBottom: ".65rem" }}>
            <label>Upload Highlight Video (local disk)</label>
            <input
              type="file"
              accept="video/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const videoUrl = await safeUploadFile(file, "Highlight video");
                if (!videoUrl) return;
                if (!portfolio.length) {
                  setPortfolio([{ id: "", title: "", description: "", videoUrl, posterUrl: "", tags: {} }]);
                } else {
                  setPortfolio(portfolio.map((p, i) => (i === 0 ? { ...p, videoUrl } : p)));
                }
                setStatus("Highlight video uploaded. Click Save Highlight to publish.");
              }}
            />
          </div>
          <Field
            label="Highlight Poster URL"
            value={highlighted.posterUrl || ""}
            onChange={(v) => {
              if (!portfolio.length) {
                setPortfolio([{ id: "", title: "", description: "", videoUrl: "", posterUrl: v, tags: {} }]);
                return;
              }
              setPortfolio(portfolio.map((p, i) => (i === 0 ? { ...p, posterUrl: v } : p)));
            }}
          />
          <div style={{ marginBottom: ".65rem" }}>
            <label>Upload Highlight Poster (local disk)</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const posterUrl = await safeUploadFile(file, "Highlight poster");
                if (!posterUrl) return;
                if (!portfolio.length) {
                  setPortfolio([{ id: "", title: "", description: "", videoUrl: "", posterUrl, tags: {} }]);
                } else {
                  setPortfolio(portfolio.map((p, i) => (i === 0 ? { ...p, posterUrl } : p)));
                }
                setStatus("Highlight poster uploaded. Click Save Highlight to publish.");
              }}
            />
          </div>
          <div style={{ marginBottom: ".65rem" }}>
            <label>Preview Aspect Mode</label>
            <select
              value={previewMode}
              onChange={(e) => {
                const next = withHighlightSetting(highlighted, "previewMode", e.target.value);
                if (!portfolio.length) {
                  setPortfolio([{ id: "", title: highlighted.title || "", description: highlighted.description || "", videoUrl: highlighted.videoUrl || "", posterUrl: highlighted.posterUrl || "", tags: next.tags }]);
                  return;
                }
                setPortfolio(portfolio.map((p, i) => (i === 0 ? next : p)));
              }}
              style={{ width: "100%" }}
            >
              <option value="auto">Auto (detect orientation)</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          {previewMode === "manual" && (
            <div style={{ marginBottom: ".65rem" }}>
              <label>Preview Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => {
                  const next = withHighlightSetting(highlighted, "aspectRatio", e.target.value);
                  if (!portfolio.length) {
                    setPortfolio([{ id: "", title: highlighted.title || "", description: highlighted.description || "", videoUrl: highlighted.videoUrl || "", posterUrl: highlighted.posterUrl || "", tags: next.tags }]);
                    return;
                  }
                  setPortfolio(portfolio.map((p, i) => (i === 0 ? next : p)));
                }}
                style={{ width: "100%" }}
              >
                <option value="16/9">16:9 (Widescreen)</option>
                <option value="4/3">4:3</option>
                <option value="1/1">1:1 (Square)</option>
                <option value="4/5">4:5 (Portrait)</option>
                <option value="9/16">9:16 (Vertical)</option>
              </select>
            </div>
          )}
          <button className="button">Save Highlight</button>
        </form>
      );
    }

    if (tab === "Contact") {
      return (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <form onSubmit={async (e) => {
            e.preventDefault();
            await requestJson(
              "/api/cms/contact",
              { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contact) },
              "Contact saved"
            );
          }}>
            <Field label="Email" value={contact.email || ""} onChange={(v) => setContact({ ...contact, email: v })} />
            <Field label="Phone" value={contact.phone || ""} onChange={(v) => setContact({ ...contact, phone: v })} />
            <Field label="WhatsApp" value={contact.whatsapp || ""} onChange={(v) => setContact({ ...contact, whatsapp: v })} />
            <Field label="Location" value={contact.location || ""} onChange={(v) => setContact({ ...contact, location: v })} />
            <button className="button">Save Contact</button>
          </form>

          <div>
            <h3 style={{ margin: "0 0 .5rem", fontSize: "1rem" }}>Inquiries from the website</h3>
            <p style={{ margin: "0 0 .75rem", color: "var(--muted)", fontSize: ".86rem" }}>
              Submissions from the home page contact form (email, project, budget).
            </p>
            {inquiries.length === 0 ? (
              <p style={{ margin: 0, color: "var(--muted)", fontSize: ".88rem" }}>No inquiries yet.</p>
            ) : (
              <div className="admin-inquiries-list" style={{ display: "grid", gap: ".65rem" }}>
                {inquiries.map((row) => (
                  <article key={row.id} className="panel" style={{ padding: ".75rem" }}>
                    <p style={{ margin: "0 0 .35rem", fontSize: ".78rem", color: "var(--muted)" }}>
                      {row.createdAt ? new Date(row.createdAt).toLocaleString() : ""}
                    </p>
                    <p style={{ margin: "0 0 .25rem" }}>
                      <strong>Email:</strong>{" "}
                      <a href={`mailto:${row.email}`}>{row.email}</a>
                    </p>
                    <p style={{ margin: "0 0 .25rem", whiteSpace: "pre-wrap" }}>
                      <strong>Project:</strong> {row.project || "—"}
                    </p>
                    <p style={{ margin: "0 0 .65rem" }}>
                      <strong>Budget:</strong> {row.budget || "—"}
                    </p>
                    <button
                      className="button"
                      type="button"
                      onClick={async () => {
                        if (!window.confirm("Delete this inquiry? This cannot be undone.")) return;
                        const result = await requestJson(
                          `/api/cms/inquiries/${row.id}`,
                          { method: "DELETE" },
                          "Inquiry deleted"
                        );
                        if (result.ok) {
                          setInquiries((prev) => prev.filter((item) => item.id !== row.id));
                        }
                      }}
                      style={{ background: "rgba(255,80,80,0.25)", color: "#fff", padding: ".4rem .75rem" }}
                    >
                      Delete
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (tab === "Hiring") {
      return (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await requestJson(
              "/api/cms/hiring",
              { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(hiring) },
              "Hiring page saved"
            );
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".55rem",
              marginBottom: "1rem",
              cursor: "pointer",
              fontSize: ".95rem"
            }}
          >
            <input
              type="checkbox"
              checked={Boolean(hiring.isVisible)}
              onChange={(e) => setHiring({ ...hiring, isVisible: e.target.checked })}
            />
            Show &quot;Hiring&quot; in the main site navigation (header)
          </label>
          <p style={{ marginTop: 0, marginBottom: "1rem", color: "var(--muted)", fontSize: ".86rem", lineHeight: 1.5 }}>
            When off, the page stays at <strong>/hiring</strong> with a short message; turn on to publish the role and nav link.
          </p>
          <Field
            label="Hiring for (profile / post title)"
            value={hiring.roleTitle || ""}
            onChange={(v) => setHiring({ ...hiring, roleTitle: v })}
          />
          <Field
            label="About the role / profile"
            value={hiring.profileDescription || ""}
            onChange={(v) => setHiring({ ...hiring, profileDescription: v })}
            textarea
            rows={10}
          />
          <Field
            label="Who can apply"
            value={hiring.whoCanApply || ""}
            onChange={(v) => setHiring({ ...hiring, whoCanApply: v })}
            textarea
            rows={6}
          />
          <Field
            label="Apply button label"
            value={hiring.applyButtonLabel || "Apply"}
            onChange={(v) => setHiring({ ...hiring, applyButtonLabel: v })}
          />
          <Field
            label="Apply button URL (Google Form, email mailto:, or careers link)"
            value={hiring.applyUrl || ""}
            onChange={(v) => setHiring({ ...hiring, applyUrl: v })}
          />
          <button className="button">Save Hiring page</button>
        </form>
      );
    }

    if (tab === "Team") {
      return (
        <div className="admin-team" style={{ display: "grid", gap: ".75rem" }}>
          <AdminSortableList
            items={team}
            onReorder={setTeam}
            onPersist={(items) => persistListOrder("team", items, setTeam, "Team order saved")}
          >
            {(item, i) => (
            <div className="panel" style={{ padding: ".75rem" }}>
              <Field label={`Member ${i + 1} Name`} value={item.name || ""} onChange={(v) => setTeam(team.map((m) => m.id === item.id ? { ...m, name: v } : m))} />
              <Field label="Tagline" value={item.subtitle || ""} onChange={(v) => setTeam(team.map((m) => m.id === item.id ? { ...m, subtitle: v } : m))} />
              <Field label="Description" value={item.description || ""} onChange={(v) => setTeam(team.map((m) => m.id === item.id ? { ...m, description: v } : m))} textarea />
              <Field
                label="Photo URL"
                value={item.photoUrl || ""}
                onChange={(v) => setTeam(team.map((m) => (m.id === item.id ? { ...m, photoUrl: v } : m)))}
              />
              <div className="admin-file-row">
                <label>Upload photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const photoUrl = await safeUploadFile(file, `${item.name || "Team"} photo`);
                    if (!photoUrl) return;
                    setTeam(team.map((m) => (m.id === item.id ? { ...m, photoUrl } : m)));
                    setStatus(`Photo uploaded for ${item.name || "member"}. Click Save to publish.`);
                  }}
                />
              </div>
              {item.photoUrl ? (
                <div style={{ marginBottom: ".65rem" }}>
                  <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>Preview</span>
                  <img
                    src={item.photoUrl}
                    alt=""
                    style={{
                      display: "block",
                      marginTop: ".35rem",
                      maxWidth: "min(200px, 100%)",
                      borderRadius: "12px",
                      border: "1px solid var(--line)"
                    }}
                  />
                </div>
              ) : null}
              <div style={{ display: "flex", gap: ".5rem" }}>
                <button className="button" type="button" onClick={async () => {
                  await requestJson(
                    `/api/cms/team/${item.id}`,
                    { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) },
                    `Team member ${i + 1} saved`
                  );
                }}>Save</button>
                <button className="button" type="button" onClick={async () => {
                  await requestJson(`/api/cms/team/${item.id}`, { method: "DELETE" }, `Team member ${i + 1} removed`, true);
                }}>Delete</button>
              </div>
            </div>
            )}
          </AdminSortableList>
          <button className="button" type="button" onClick={async () => {
            const nextIndex = team.length + 1;
            await requestJson("/api/cms/team", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                slug: `team-member-${Date.now()}`,
                name: `Team Member ${nextIndex}`,
                subtitle: "",
                description: "",
                position: team.length
              })
            }, "Added new team member tab", true);
          }}>Add Team Member</button>
        </div>
      );
    }


    if (tab === "Services") {
      return (
        <div style={{ display: "grid", gap: ".75rem" }}>
          <AdminSortableList
            items={services}
            onReorder={setServices}
            onPersist={(items) => persistListOrder("services", items, setServices, "Services order saved")}
          >
            {(item, i) => (
            <div className="panel" style={{ padding: ".75rem" }}>
              <Field label={`Service ${i + 1} Title`} value={item.title} onChange={(v) => setServices(services.map((s) => s.id === item.id ? { ...s, title: v } : s))} />
              <Field label="Description" value={item.description} onChange={(v) => setServices(services.map((s) => s.id === item.id ? { ...s, description: v } : s))} textarea />
              <div style={{ display: "flex", gap: ".5rem" }}>
                <button className="button" onClick={async () => {
                  await requestJson(
                    `/api/cms/services/${item.id}`,
                    { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) },
                    `Service ${i + 1} saved`
                  );
                }}>Save</button>
                <button className="button" type="button" onClick={async () => {
                  await requestJson(`/api/cms/services/${item.id}`, { method: "DELETE" }, `Service ${i + 1} removed`, true);
                }}>Delete</button>
              </div>
            </div>
            )}
          </AdminSortableList>
          <button className="button" onClick={async () => {
            await requestJson(
              "/api/cms/services",
              { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "New Service", description: "Describe service", position: services.length }) },
              "Service added",
              true
            );
          }}>Add Service</button>
        </div>
      );
    }

    if (tab === "Portfolio") {
      const portfolioSections = getPortfolioSections(portfolio);
      const portfolioDisplayOrder = portfolioSections.flatMap((s) => s.items);
      const displayIndexById = new Map(portfolioDisplayOrder.map((item, idx) => [item.id, idx + 1]));

      return (
        <div className="admin-portfolio" style={{ display: "grid", gap: "1rem" }}>
          <p className="admin-sortable-hint" style={{ margin: 0 }}>
            Drag the ⋮⋮ handle on any project to reorder within its type. Order saves automatically and updates the public site.
          </p>
          <details className="admin-portfolio-add panel" open>
            <summary className="admin-portfolio-summary admin-portfolio-summary--add">Add a project</summary>
            <div style={{ padding: ".25rem .5rem 1rem", display: "grid", gap: ".65rem" }}>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: ".88rem", lineHeight: 1.45 }}>
                Creates a new entry. Edit highlight copy under <strong>Home → Project highlight</strong> for the first item.
              </p>
              <Field label="Title" value={newPortfolioTitle} onChange={setNewPortfolioTitle} />
              <div style={{ marginBottom: 0 }}>
                <label>Type</label>
                <select
                  className="admin-form-select"
                  value={newPortfolioType}
                  onChange={(e) => setNewPortfolioType(e.target.value)}
                  aria-label="New project type"
                >
                  {PROJECT_TYPES.map((ptype) => <option key={ptype} value={ptype}>{ptype}</option>)}
                </select>
              </div>
              <Field label="Short description (cards & carousel)" value={newPortfolioDescription} onChange={setNewPortfolioDescription} textarea rows={3} />
              <button
                className="button"
                type="button"
                onClick={async () => {
                  const title = (newPortfolioTitle || "").trim();
                  if (!title) {
                    setStatus("Please enter a project title.");
                    return;
                  }
                  const res = await fetch("/api/cms/portfolio", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title,
                      description: (newPortfolioDescription || "").trim() || "Project description",
                      tags: { projectType: newPortfolioType },
                      position: portfolio.length
                    })
                  });
                  if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    setStatus(err.error || "Failed to add new portfolio project.");
                    return;
                  }
                  setNewPortfolioTitle("");
                  setNewPortfolioDescription("");
                  await loadAll();
                  setStatus("Project added.");
                }}
              >
                Add project
              </button>
            </div>
          </details>

          {portfolioSections.map(({ type, items }) => (
            <details key={type} className="admin-portfolio-type panel" open>
              <summary className="admin-portfolio-summary">
                {type}
                <span className="admin-portfolio-count">{items.length}</span>
              </summary>
              <div style={{ display: "grid", gap: ".65rem", padding: ".35rem .5rem 1rem" }}>
                <AdminSortableList
                  items={items}
                  hint=""
                  className="admin-sortable--nested"
                  onReorder={(reordered) =>
                    setPortfolio((prev) => mergePortfolioSectionOrder(prev, type, reordered))
                  }
                  onPersist={async (reordered) => {
                    let next;
                    setPortfolio((prev) => {
                      next = mergePortfolioSectionOrder(prev, type, reordered);
                      return next;
                    });
                    await persistListOrder("portfolio", next, setPortfolio, "Portfolio order saved");
                  }}
                >
                  {(item) => (
                  <details className="admin-portfolio-item panel">
                    <summary className="admin-portfolio-item-summary">
                      <span className="admin-portfolio-item-title">{item.title?.trim() || "Untitled project"}</span>
                      <span className="admin-portfolio-item-type">{getPortfolioProjectType(item)}</span>
                    </summary>
                    <div style={{ padding: ".5rem .5rem .85rem", display: "grid", gap: ".75rem" }}>
                      <details className="admin-nested" open>
                        <summary className="admin-nested-summary">Basic info</summary>
                        <div style={{ paddingTop: ".5rem", display: "grid", gap: ".6rem" }}>
                          <Field label="Title" value={item.title} onChange={(v) => setPortfolio(portfolio.map((p) => (p.id === item.id ? { ...p, title: v } : p)))} />
                          <div style={{ marginBottom: 0 }}>
                            <label>Type</label>
                            <select
                              className="admin-form-select"
                              value={getPortfolioProjectType(item)}
                              onChange={(e) => {
                                const nextItem = withPortfolioProjectType(item, e.target.value);
                                setPortfolio(portfolio.map((p) => (p.id === item.id ? nextItem : p)));
                              }}
                              aria-label={`Type for ${item.title || "project"}`}
                            >
                              {PROJECT_TYPES.map((ptype) => <option key={ptype} value={ptype}>{ptype}</option>)}
                            </select>
                          </div>
                          <Field
                            label="Short description (cards & carousel)"
                            value={item.description}
                            onChange={(v) => setPortfolio(portfolio.map((p) => (p.id === item.id ? { ...p, description: v } : p)))}
                            textarea
                            rows={3}
                          />
                        </div>
                      </details>

                      <details className="admin-nested">
                        <summary className="admin-nested-summary">Video & poster</summary>
                        <div style={{ paddingTop: ".5rem", display: "grid", gap: ".6rem" }}>
                          <Field label="Video URL" value={item.videoUrl || ""} onChange={(v) => setPortfolio(portfolio.map((p) => (p.id === item.id ? { ...p, videoUrl: v } : p)))} />
                          <Field label="Poster URL" value={item.posterUrl || ""} onChange={(v) => setPortfolio(portfolio.map((p) => (p.id === item.id ? { ...p, posterUrl: v } : p)))} />
                          <div className="admin-file-row">
                            <label>Upload video</label>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const videoUrl = await safeUploadFile(file, `${item.title} video`);
                                if (!videoUrl) return;
                                setPortfolio(portfolio.map((p) => (p.id === item.id ? { ...p, videoUrl } : p)));
                                setStatus(`Video uploaded for ${item.title || "project"}. Save to publish.`);
                              }}
                            />
                          </div>
                          <div className="admin-file-row">
                            <label>Upload poster</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const posterUrl = await safeUploadFile(file, `${item.title} poster`);
                                if (!posterUrl) return;
                                setPortfolio(portfolio.map((p) => (p.id === item.id ? { ...p, posterUrl } : p)));
                                setStatus(`Poster uploaded for ${item.title || "project"}. Save to publish.`);
                              }}
                            />
                          </div>
                        </div>
                      </details>

                      <details className="admin-nested">
                        <summary className="admin-nested-summary">Related photos (detail page)</summary>
                        <div style={{ paddingTop: ".5rem", display: "grid", gap: ".55rem" }}>
                          {getPortfolioRelatedPhotos(item).map((photoUrl, idx) => (
                            <div key={`${item.id}-photo-${idx}`} className="admin-related-photo">
                              <Field
                                label={`Photo ${idx + 1} URL`}
                                value={photoUrl}
                                onChange={(v) => {
                                  const nextPhotos = [...getPortfolioRelatedPhotos(item)];
                                  nextPhotos[idx] = v;
                                  const nextItem = withPortfolioRelatedPhotos(item, nextPhotos);
                                  setPortfolio(portfolio.map((p) => (p.id === item.id ? nextItem : p)));
                                }}
                              />
                              <div style={{ display: "flex", flexWrap: "wrap", gap: ".45rem", alignItems: "center" }}>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const uploadedUrl = await safeUploadFile(file, `Related photo ${idx + 1}`);
                                    if (!uploadedUrl) return;
                                    const nextPhotos = [...getPortfolioRelatedPhotos(item)];
                                    nextPhotos[idx] = uploadedUrl;
                                    const nextItem = withPortfolioRelatedPhotos(item, nextPhotos);
                                    setPortfolio(portfolio.map((p) => (p.id === item.id ? nextItem : p)));
                                    setStatus(`Photo ${idx + 1} uploaded. Save to publish.`);
                                  }}
                                />
                                <button
                                  className="button"
                                  type="button"
                                  onClick={() => {
                                    const nextPhotos = getPortfolioRelatedPhotos(item).filter((_, i2) => i2 !== idx);
                                    const nextItem = withPortfolioRelatedPhotos(item, nextPhotos);
                                    setPortfolio(portfolio.map((p) => (p.id === item.id ? nextItem : p)));
                                  }}
                                  style={{ padding: ".4rem .65rem" }}
                                >
                                  Remove slot
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            className="button"
                            type="button"
                            onClick={() => {
                              const nextPhotos = [...getPortfolioRelatedPhotos(item), ""];
                              const nextItem = withPortfolioRelatedPhotos(item, nextPhotos);
                              setPortfolio(portfolio.map((p) => (p.id === item.id ? nextItem : p)));
                            }}
                            style={{ padding: ".45rem .75rem", justifySelf: "start" }}
                          >
                            Add photo slot
                          </button>
                        </div>
                      </details>

                      <div className="admin-portfolio-actions">
                        <button
                          className="button"
                          type="button"
                          onClick={async () => {
                            await requestJson(
                              `/api/cms/portfolio/${item.id}`,
                              { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) },
                              `Project ${displayIndexById.get(item.id) ?? ""} saved`
                            );
                          }}
                        >
                          Save
                        </button>
                        <button
                          className="button"
                          type="button"
                          onClick={async () => {
                            await requestJson(
                              `/api/cms/portfolio/${item.id}`,
                              { method: "DELETE" },
                              `Project ${displayIndexById.get(item.id) ?? ""} removed`,
                              true
                            );
                          }}
                          style={{ background: "rgba(255,80,80,0.25)", color: "#fff" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </details>
                  )}
                </AdminSortableList>
              </div>
            </details>
          ))}
        </div>
      );
    }

    if (tab === "Testimonials") {
      return (
        <div className="admin-testimonials" style={{ display: "grid", gap: ".75rem" }}>
          <AdminSortableList
            items={testimonials}
            onReorder={setTestimonials}
            onPersist={(items) => persistListOrder("testimonials", items, setTestimonials, "Testimonials order saved")}
          >
            {(item, i) => (
              <div className="panel" style={{ padding: ".75rem" }}>
                <Field
                  label={`Testimonial ${i + 1} Name`}
                  value={item.name || ""}
                  onChange={(v) => setTestimonials(testimonials.map((t) => (t.id === item.id ? { ...t, name: v } : t)))}
                />
                <Field
                  label="Company"
                  value={item.company || ""}
                  onChange={(v) => setTestimonials(testimonials.map((t) => (t.id === item.id ? { ...t, company: v } : t)))}
                />
                <Field
                  label="Role"
                  value={item.role || ""}
                  onChange={(v) => setTestimonials(testimonials.map((t) => (t.id === item.id ? { ...t, role: v } : t)))}
                />
                <Field
                  label="Testimonial"
                  value={item.testimonial || ""}
                  onChange={(v) => setTestimonials(testimonials.map((t) => (t.id === item.id ? { ...t, testimonial: v } : t)))}
                  textarea
                  rows={5}
                />
                <div style={{ marginBottom: ".65rem" }}>
                  <label>Rating</label>
                  <select
                    className="admin-form-select"
                    value={String(item.rating ?? 5)}
                    onChange={(e) =>
                      setTestimonials(testimonials.map((t) => (t.id === item.id ? { ...t, rating: Number(e.target.value) } : t)))
                    }
                    aria-label={`Rating for ${item.name || "testimonial"}`}
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} star{rating === 1 ? "" : "s"}
                      </option>
                    ))}
                  </select>
                </div>
                <Field
                  label="Image URL"
                  value={item.imageUrl || ""}
                  onChange={(v) => setTestimonials(testimonials.map((t) => (t.id === item.id ? { ...t, imageUrl: v } : t)))}
                />
                <div className="admin-file-row">
                  <label>Upload image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const imageUrl = await safeUploadFile(file, `${item.name || "Testimonial"} image`);
                      if (!imageUrl) return;
                      setTestimonials(testimonials.map((t) => (t.id === item.id ? { ...t, imageUrl } : t)));
                      setStatus(`Image uploaded for ${item.name || "testimonial"}. Click Save to publish.`);
                    }}
                  />
                </div>
                {item.imageUrl ? (
                  <div style={{ marginBottom: ".65rem" }}>
                    <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>Preview</span>
                    <img
                      src={item.imageUrl}
                      alt=""
                      style={{
                        display: "block",
                        marginTop: ".35rem",
                        width: "min(180px, 100%)",
                        aspectRatio: "16 / 10",
                        objectFit: "cover",
                        borderRadius: "12px",
                        border: "1px solid var(--line)"
                      }}
                    />
                  </div>
                ) : null}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".55rem",
                    marginBottom: ".75rem",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(item.featured)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setTestimonials(
                        testimonials.map((t) => ({
                          ...t,
                          featured: t.id === item.id ? checked : checked ? false : t.featured
                        }))
                      );
                    }}
                  />
                  Featured testimonial (center card)
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
                  <button
                    className="button"
                    type="button"
                    onClick={async () => {
                      const result = await requestJson(
                        `/api/cms/testimonials/${item.id}`,
                        { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) },
                        `Testimonial ${i + 1} saved`
                      );
                      if (result.ok) await loadAll();
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="button"
                    type="button"
                    onClick={async () => {
                      await requestJson(
                        `/api/cms/testimonials/${item.id}`,
                        { method: "DELETE" },
                        `Testimonial ${i + 1} removed`,
                        true
                      );
                    }}
                    style={{ background: "rgba(255,80,80,0.25)", color: "#fff" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </AdminSortableList>
          <button
            className="button"
            type="button"
            onClick={async () => {
              await requestJson(
                "/api/cms/testimonials",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: "New Client",
                    company: "Company name",
                    role: "Role",
                    testimonial: "Write the testimonial here.",
                    rating: 5,
                    imageUrl: "",
                    featured: testimonials.length === 0,
                    position: testimonials.length
                  })
                },
                "Testimonial added",
                true
              );
            }}
          >
            Add Testimonial
          </button>
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gap: ".75rem" }}>
        <AdminSortableList
          items={clients}
          onReorder={setClients}
          onPersist={(items) => persistListOrder("clients", items, setClients, "Clients order saved")}
        >
          {(item, i) => (
          <div className="panel" style={{ padding: ".75rem" }}>
            <Field label={`Client ${i + 1} Name`} value={item.name} onChange={(v) => setClients(clients.map((c) => c.id === item.id ? { ...c, name: v } : c))} />
            <Field
              label="Logo URL"
              value={item.logoUrl || ""}
              onChange={(v) => setClients(clients.map((c) => c.id === item.id ? { ...c, logoUrl: v } : c))}
            />
            <div style={{ marginBottom: ".5rem" }}>
              <label>Replace Logo</label>
              <input type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const logoUrl = await safeUploadFile(file, `${item.name} logo`);
                if (!logoUrl) return;
                const next = { ...item, logoUrl };
                setClients(clients.map((c) => c.id === item.id ? next : c));
                await requestJson(`/api/cms/clients/${item.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(next)
                }, `Uploaded and saved logo for ${item.name}`);
              }} />
            </div>
            <div style={{ display: "flex", gap: ".5rem" }}>
              <button className="button" onClick={async () => {
                await requestJson(
                  `/api/cms/clients/${item.id}`,
                  { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) },
                  `Client ${i + 1} saved`
                );
              }}>Save</button>
              <button className="button" type="button" onClick={async () => {
                await requestJson(`/api/cms/clients/${item.id}`, { method: "DELETE" }, `Client ${i + 1} removed`, true);
              }}>Delete</button>
            </div>
          </div>
          )}
        </AdminSortableList>
        <button className="button" onClick={async () => {
          await requestJson(
            "/api/cms/clients",
            { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "New Client", position: clients.length }) },
            "Client added",
            true
          );
        }}>Add Client</button>
      </div>
    );
  }, [tab, hero, about, contact, inquiries, hiring, services, portfolio, clients, testimonials, team, newPortfolioTitle, newPortfolioDescription, newPortfolioType]);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div
        className="panel admin-dash-toolbar"
        style={{
          padding: ".85rem 1rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "1rem"
        }}
      >
        <label style={{ display: "grid", gap: ".35rem", flex: "1 1 220px", minWidth: "min(100%, 240px)" }}>
          <span style={{ fontSize: ".72rem", color: "rgba(255,255,255,.55)", textTransform: "uppercase", letterSpacing: ".07em" }}>
            Section
          </span>
          <select
            className="admin-nav-select"
            value={tab}
            onChange={(e) => {
              setTab(e.target.value);
              setStatus("");
            }}
            aria-label="Choose CMS section"
          >
            {NAV_SECTIONS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        {status ? (
          <p style={{ margin: 0, color: "var(--muted)", fontSize: ".9rem", flex: "1 1 200px", textAlign: "right" }}>{status}</p>
        ) : (
          <p style={{ margin: 0, color: "rgba(255,255,255,.35)", fontSize: ".85rem", flex: "1 1 200px", textAlign: "right" }}>
            Select a section to edit
          </p>
        )}
      </div>
      <section className="panel admin-dash-panel" style={{ padding: "1rem 1.1rem" }}>
        <h2 style={{ marginTop: 0, marginBottom: ".35rem", fontSize: "clamp(1.15rem, 2.5vw, 1.35rem)" }}>{getTabLabel(tab)}</h2>
        <p style={{ marginTop: 0, marginBottom: "1rem", color: "var(--muted)", fontSize: ".88rem" }}>
          {tab === "Portfolio" && "Projects, ordering, and media. Drag ⋮⋮ handles to reorder within each type."}
          {tab === "Hero" && "Homepage banner headline, copy, and background video."}
          {tab === "Highlight" && "Featured project on the home page (first portfolio item)." }
          {tab === "Services" && "Service cards and ordering. Drag ⋮⋮ handles to reorder."}
          {tab === "Clients" && "Client logos and carousel. Drag ⋮⋮ handles to reorder."}
          {tab === "Testimonials" && "Client testimonials for the home page. Drag ⋮⋮ handles to reorder and mark one as featured."}
          {tab === "About" && "Vision, style, and trust blocks."}
          {tab === "Team" && "Team profiles and bios. Drag ⋮⋮ handles to reorder."}
          {tab === "Contact" && "Site contact details and inquiries submitted from the home page form."}
          {tab === "Hiring" && "/hiring job post, apply link, and nav visibility."}
        </p>
        {sectionForm}
      </section>
    </div>
  );
}

function Field({ label, value, onChange, textarea = false, rows = 3 }) {
  return (
    <div style={{ marginBottom: ".65rem" }}>
      <label>{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} style={{ width: "100%" }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%" }} />
      )}
    </div>
  );
}

function StylizedTextarea({ label, value, onChange }) {
  const textareaId = `styled-${label.toLowerCase()}`;

  const applyWrap = (prefix, suffix = prefix) => {
    const el = document.getElementById(textareaId);
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || "text";
    const next = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + prefix.length + selected.length + suffix.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const applyHeading = () => {
    const el = document.getElementById(textareaId);
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const before = value.slice(0, start);
    const after = value.slice(start);
    const next = `${before}\n# Heading\n${after}`;
    onChange(next);
  };

  const applyColor = (hex) => {
    const el = document.getElementById(textareaId);
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || "text";
    const next = value.slice(0, start) + `[color=${hex}]` + selected + `[/color]` + value.slice(end);
    onChange(next);
  };

  return (
    <div style={{ marginBottom: ".75rem" }}>
      <label>{label}</label>
      <div style={{ display: "flex", gap: ".4rem", margin: ".35rem 0 .4rem" }}>
        <button type="button" className="button" style={{ padding: ".35rem .65rem" }} onClick={() => applyWrap("**", "**")}>Bold</button>
        <button type="button" className="button" style={{ padding: ".35rem .65rem" }} onClick={() => applyWrap("*", "*")}>Italic</button>
        <button type="button" className="button" style={{ padding: ".35rem .65rem" }} onClick={() => applyWrap("==", "==")}>Highlight</button>
        <button type="button" className="button" style={{ padding: ".35rem .65rem" }} onClick={applyHeading}>Heading</button>
        <button type="button" className="button" style={{ padding: ".35rem .65rem", background: "#ffe38a", color: "#18120a" }} onClick={() => applyColor("#FFD700")}>Gold</button>
        <button type="button" className="button" style={{ padding: ".35rem .65rem", background: "#8ab4ff", color: "#081220" }} onClick={() => applyColor("#8AB4FF")}>Blue</button>
        <button type="button" className="button" style={{ padding: ".35rem .65rem", background: "#9af2c0", color: "#082015" }} onClick={() => applyColor("#9AF2C0")}>Green</button>
        <button type="button" className="button" style={{ padding: ".35rem .65rem", background: "#ffb3bd", color: "#2a0d12" }} onClick={() => applyColor("#FFB3BD")}>Pink</button>
      </div>
      <textarea
        id={textareaId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        style={{ width: "100%" }}
        placeholder="Use styling controls above. Supported: **bold**, *italic*, ==highlight==, # Heading, [color=#FFD700]text[/color]"
      />
    </div>
  );
}

function normalizeTags(tags) {
  if (!tags || typeof tags !== "object" || Array.isArray(tags)) return {};
  return tags;
}

function getHighlightSetting(item, key, fallback) {
  const tags = normalizeTags(item?.tags);
  const layout = tags.highlightLayout && typeof tags.highlightLayout === "object" ? tags.highlightLayout : {};
  return layout[key] ?? fallback;
}

function withHighlightSetting(item, key, value) {
  const tags = normalizeTags(item?.tags);
  const layout = tags.highlightLayout && typeof tags.highlightLayout === "object" ? tags.highlightLayout : {};
  return {
    ...(item || {}),
    tags: {
      ...tags,
      highlightLayout: {
        ...layout,
        [key]: value
      }
    }
  };
}

function getPortfolioRelatedPhotos(item) {
  const tags = normalizeTags(item?.tags);
  const raw = tags.relatedPhotos;
  if (!Array.isArray(raw)) return [];
  return raw.map((v) => String(v || ""));
}

function withPortfolioRelatedPhotos(item, photos) {
  const tags = normalizeTags(item?.tags);
  return {
    ...(item || {}),
    tags: {
      ...tags,
      relatedPhotos: photos.map((v) => String(v ?? ""))
    }
  };
}

function withPortfolioProjectType(item, type) {
  const tags = normalizeTags(item?.tags);
  return {
    ...(item || {}),
    tags: {
      ...tags,
      projectType: type
    }
  };
}
