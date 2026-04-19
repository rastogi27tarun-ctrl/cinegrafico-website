"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PORTFOLIO_PROJECT_TYPES as PROJECT_TYPES,
  getPortfolioProjectType,
  getPortfolioSections
} from "../../lib/portfolio";

const TABS = ["Hero", "Highlight", "Services", "Portfolio", "Clients", "About", "Team", "Contact"];

export default function AdminClient() {
  const [tab, setTab] = useState("Hero");
  const [status, setStatus] = useState("");

  const [hero, setHero] = useState({ heading: "", subheading: "", ctaText: "", videoUrl: "" });
  const [about, setAbout] = useState({ vision: "", style: "", trust: "" });
  const [contact, setContact] = useState({ email: "", phone: "", whatsapp: "", location: "" });
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [clients, setClients] = useState([]);
  const [team, setTeam] = useState([]);
  const [newPortfolioTitle, setNewPortfolioTitle] = useState("");
  const [newPortfolioDescription, setNewPortfolioDescription] = useState("");
  const [newPortfolioType, setNewPortfolioType] = useState(PROJECT_TYPES[0]);

  const loadAll = async () => {
    const [h, a, c, s, p, cl, tm] = await Promise.all([
      fetch("/api/cms/hero").then((r) => r.json()),
      fetch("/api/cms/about").then((r) => r.json()),
      fetch("/api/cms/contact").then((r) => r.json()),
      fetch("/api/cms/services").then((r) => r.json()),
      fetch("/api/cms/portfolio").then((r) => r.json()),
      fetch("/api/cms/clients").then((r) => r.json()),
      fetch("/api/cms/team").then((r) => r.json())
    ]);
    setHero(h || {});
    setAbout(a || {});
    setContact(c || {});
    setServices(Array.isArray(s) ? s : []);
    setPortfolio(Array.isArray(p) ? p : []);
    setClients(Array.isArray(cl) ? cl : []);
    setTeam(Array.isArray(tm) ? tm : []);
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

  const requestJson = async (url, options, successMessage = "", reloadAfter = false) => {
    const res = await fetch(url, options);
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(payload?.error || "Request failed");
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
            value={highlighted.title || ""}
            onChange={(v) => {
              if (!portfolio.length) {
                setPortfolio([{ id: "", title: v, description: "", videoUrl: "", posterUrl: "", tags: {} }]);
                return;
              }
              setPortfolio(portfolio.map((p, i) => (i === 0 ? { ...p, title: v } : p)));
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
      );
    }

    if (tab === "Team") {
      return (
        <div style={{ display: "grid", gap: ".75rem" }}>
          {team.map((item, i) => (
            <div key={item.id} className="panel" style={{ padding: ".75rem" }}>
              <Field label={`Member ${i + 1} Name`} value={item.name || ""} onChange={(v) => setTeam(team.map((m) => m.id === item.id ? { ...m, name: v } : m))} />
              <Field label="Tagline" value={item.subtitle || ""} onChange={(v) => setTeam(team.map((m) => m.id === item.id ? { ...m, subtitle: v } : m))} />
              <Field label="Description" value={item.description || ""} onChange={(v) => setTeam(team.map((m) => m.id === item.id ? { ...m, description: v } : m))} textarea />
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
          ))}
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
          {services.map((item, i) => (
            <div key={item.id} className="panel" style={{ padding: ".75rem" }}>
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
          ))}
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
        <div style={{ display: "grid", gap: ".75rem" }}>
          <div className="panel" style={{ padding: ".85rem" }}>
            <h3 style={{ marginTop: 0, marginBottom: ".45rem" }}>Add New Portfolio Title</h3>
            <p style={{ marginTop: 0, color: "var(--muted)", fontSize: ".92rem" }}>
              Adds a new project entry without replacing existing ones.
            </p>
            <Field label="New Project Title" value={newPortfolioTitle} onChange={setNewPortfolioTitle} />
            <div style={{ marginBottom: ".65rem" }}>
              <label>Project Type</label>
              <select value={newPortfolioType} onChange={(e) => setNewPortfolioType(e.target.value)} style={{ width: "100%" }}>
                {PROJECT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <Field label="Short description (new project)" value={newPortfolioDescription} onChange={setNewPortfolioDescription} textarea rows={3} />
            <button className="button" type="button" onClick={async () => {
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
              setStatus("New portfolio project added.");
            }}>
              Add Title
            </button>
          </div>

          {portfolioSections.map(({ type, items }) => (
            <div key={type} style={{ display: "grid", gap: ".75rem" }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: ".95rem",
                  fontWeight: 600,
                  color: "rgba(255, 255, 255, 0.72)",
                  letterSpacing: "0.04em"
                }}
              >
                {type}
              </h3>
              {items.map((item) => (
            <div key={item.id} className="panel" style={{ padding: ".75rem" }}>
              <Field label="Project Title" value={item.title} onChange={(v) => setPortfolio(portfolio.map((p) => p.id === item.id ? { ...p, title: v } : p))} />
              <div style={{ marginBottom: ".65rem" }}>
                <label>Project Type</label>
                <select
                  value={getPortfolioProjectType(item)}
                  onChange={(e) => {
                    const nextItem = withPortfolioProjectType(item, e.target.value);
                    setPortfolio(portfolio.map((p) => p.id === item.id ? nextItem : p));
                  }}
                  style={{ width: "100%" }}
                >
                  {PROJECT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <Field
                label="Short description (cards & carousel)"
                value={item.description}
                onChange={(v) => setPortfolio(portfolio.map((p) => p.id === item.id ? { ...p, description: v } : p))}
                textarea
                rows={3}
              />
              <Field label="Video URL" value={item.videoUrl || ""} onChange={(v) => setPortfolio(portfolio.map((p) => p.id === item.id ? { ...p, videoUrl: v } : p))} />
              <Field label="Poster URL" value={item.posterUrl || ""} onChange={(v) => setPortfolio(portfolio.map((p) => p.id === item.id ? { ...p, posterUrl: v } : p))} />
              <div className="panel" style={{ padding: ".65rem", marginBottom: ".6rem" }}>
                <p style={{ marginTop: 0, marginBottom: ".45rem", color: "var(--muted)" }}>Related Photos (for project detail page)</p>
                {getPortfolioRelatedPhotos(item).map((photoUrl, idx) => (
                  <div key={`${item.id}-photo-${idx}`} style={{ marginBottom: ".45rem", display: "grid", gap: ".35rem" }}>
                    <Field
                      label={`Photo ${idx + 1} URL`}
                      value={photoUrl}
                      onChange={(v) => {
                        const nextPhotos = [...getPortfolioRelatedPhotos(item)];
                        nextPhotos[idx] = v;
                        const nextItem = withPortfolioRelatedPhotos(item, nextPhotos);
                        setPortfolio(portfolio.map((p) => p.id === item.id ? nextItem : p));
                      }}
                    />
                    <div style={{ display: "flex", gap: ".45rem" }}>
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
                          setPortfolio(portfolio.map((p) => p.id === item.id ? nextItem : p));
                          setStatus(`Uploaded related photo ${idx + 1} for ${item.title}. Click Save to publish.`);
                        }}
                      />
                      <button
                        className="button"
                        type="button"
                        onClick={() => {
                          const nextPhotos = getPortfolioRelatedPhotos(item).filter((_, i2) => i2 !== idx);
                          const nextItem = withPortfolioRelatedPhotos(item, nextPhotos);
                          setPortfolio(portfolio.map((p) => p.id === item.id ? nextItem : p));
                        }}
                        style={{ padding: ".45rem .7rem" }}
                      >
                        Remove
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
                    setPortfolio(portfolio.map((p) => p.id === item.id ? nextItem : p));
                  }}
                  style={{ padding: ".45rem .7rem" }}
                >
                  Add Related Photo
                </button>
              </div>
              <div style={{ marginBottom: ".5rem" }}>
                <label>Upload Video (local disk)</label>
                <input type="file" accept="video/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const videoUrl = await safeUploadFile(file, `${item.title} video`);
                  if (!videoUrl) return;
                  setPortfolio(portfolio.map((p) => p.id === item.id ? { ...p, videoUrl } : p));
                  setStatus(`Uploaded video for ${item.title}. Click Save to publish.`);
                }} />
              </div>
              <div style={{ marginBottom: ".5rem" }}>
                <label>Upload Poster (local disk)</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const posterUrl = await safeUploadFile(file, `${item.title} poster`);
                  if (!posterUrl) return;
                  setPortfolio(portfolio.map((p) => p.id === item.id ? { ...p, posterUrl } : p));
                  setStatus(`Uploaded poster for ${item.title}. Click Save to publish.`);
                }} />
              </div>
              <div style={{ display: "flex", gap: ".5rem" }}>
                <button className="button" onClick={async () => {
                  await requestJson(
                    `/api/cms/portfolio/${item.id}`,
                    { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) },
                    `Portfolio ${displayIndexById.get(item.id) ?? ""} saved`
                  );
                }}>Save</button>
                <button className="button" type="button" onClick={async () => {
                  await requestJson(`/api/cms/portfolio/${item.id}`, { method: "DELETE" }, `Portfolio ${displayIndexById.get(item.id) ?? ""} removed`, true);
                }}>Delete</button>
              </div>
            </div>
              ))}
            </div>
          ))}
          <button className="button" type="button" onClick={async () => {
            const res = await fetch("/api/cms/portfolio", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: "New Project", description: "Project description", position: portfolio.length })
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              setStatus(err.error || "Failed to add portfolio item.");
              return;
            }
            await loadAll();
            setStatus("Portfolio item added.");
          }}>Add Portfolio Item</button>
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gap: ".75rem" }}>
        {clients.map((item, i) => (
          <div key={item.id} className="panel" style={{ padding: ".75rem" }}>
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
        ))}
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
  }, [tab, hero, about, contact, services, portfolio, clients, team, newPortfolioTitle, newPortfolioDescription, newPortfolioType]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1rem" }}>
      <aside className="panel" style={{ padding: ".75rem", height: "fit-content" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setStatus(""); }}
            style={{
              width: "100%",
              textAlign: "left",
              marginBottom: ".5rem",
              padding: ".62rem .68rem",
              borderRadius: "12px",
              border: "1px solid var(--line)",
              color: "#fff",
              background: tab === t ? "linear-gradient(135deg, rgba(255,215,0,.16), rgba(255,184,0,.08))" : "rgba(255,255,255,.015)"
            }}
          >
            <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".6rem" }}>
              <span style={{ display: "grid", lineHeight: 1.15 }}>
                <span style={{ fontSize: ".68rem", color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".06em" }}>
                  Heading
                </span>
                <span style={{ fontSize: ".95rem", fontWeight: 600 }}>{t}</span>
              </span>
              <span
                style={{
                  width: "1.1rem",
                  height: "1.1rem",
                  borderRadius: "999px",
                  display: "grid",
                  placeItems: "center",
                  background: tab === t ? "rgba(255, 215, 0, 0.2)" : "rgba(255, 215, 0, 0.08)"
                }}
              >
                <span
                  style={{
                    width: ".5rem",
                    height: ".5rem",
                    borderRadius: "999px",
                    background: "#ffd700",
                    boxShadow: tab === t ? "0 0 0 4px rgba(255, 215, 0, 0.08)" : "none"
                  }}
                />
              </span>
            </span>
          </button>
        ))}
      </aside>
      <section className="panel" style={{ padding: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>{tab}</h2>
        {status && <p style={{ color: "var(--muted)" }}>{status}</p>}
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
