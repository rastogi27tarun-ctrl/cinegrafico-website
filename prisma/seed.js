const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const SEED_ENV = process.env.SEED_ENV || process.env.NODE_ENV || "development";

const ASSET_BASE = "/assets";
const ASSETS = {
  heroVideo: `${ASSET_BASE}/hero-backdrop.mp4`,
  clients: {
    nike: `${ASSET_BASE}/clients/nike.svg`,
    adidas: `${ASSET_BASE}/clients/adidas.svg`,
    pepsi: `${ASSET_BASE}/clients/pepsi.svg`,
    redbull: `${ASSET_BASE}/clients/redbull.svg`,
    spotify: `${ASSET_BASE}/clients/spotify.svg`,
    samsung: `${ASSET_BASE}/clients/samsung.svg`
  },
  portfolio: {
    brandLaunch: {
      video: `${ASSET_BASE}/portfolio/brand-launch.mp4`,
      poster: `${ASSET_BASE}/portfolio/brand-launch.jpg`
    },
    productHero: {
      video: `${ASSET_BASE}/portfolio/product-hero.mp4`,
      poster: `${ASSET_BASE}/portfolio/product-hero.jpg`
    },
    festivalRecap: {
      video: `${ASSET_BASE}/portfolio/festival-recap.mp4`,
      poster: `${ASSET_BASE}/portfolio/festival-recap.jpg`
    },
    corporateProfile: {
      video: `${ASSET_BASE}/portfolio/corporate-profile.mp4`,
      poster: `${ASSET_BASE}/portfolio/corporate-profile.jpg`
    },
    motionIdentity: {
      video: `${ASSET_BASE}/portfolio/motion-identity.mp4`,
      poster: `${ASSET_BASE}/portfolio/motion-identity.jpg`
    }
  }
};

const ABOUT_VISION =
  "We aim to deliver high-quality production and post-production services through a skilled and dedicated team. Our vision is to creatively and efficiently meet diverse client needs, turning ideas into impactful visual stories.";

const ABOUT_STYLE =
  "We blend creativity with cutting-edge technology to deliver visually striking content across production and post-production. Our style combines 2D/3D animation, motion graphics, and cinematic storytelling with modern tools like AI editing. We focus on crafting polished, dynamic visuals that bring ideas to life with clarity and impact.";

const ABOUT_TRUST =
  "Clients trust us for our skilled team, consistent quality, and attention to detail across every stage of production and post-production. We combine creative vision with reliable execution, ensuring projects are delivered on time and aligned with client goals. Our transparent process and commitment to excellence build lasting, dependable partnerships.";

const DATASETS = {
  development: {
    users: {
      admin: { email: "admin@cinegrafico.local", name: "Admin User", password: "admin12345" },
      editor: { email: "editor@cinegrafico.local", name: "Editor User", password: "editor12345" }
    },
    hero: {
      heading: "Make your brand feel like a movie.",
      subheading: "Cinegrafico Studios crafts premium visuals, identity, and motion with cinematic precision.",
      ctaText: "Start a Project",
      videoUrl: ASSETS.heroVideo
    },
    about: {
      vision: ABOUT_VISION,
      style: ABOUT_STYLE,
      trust: ABOUT_TRUST
    },
    contact: {
      email: "cinegraficostudios@gmail.com",
      phone: "+91 00000 00000",
      whatsapp: "+91 00000 00000",
      location: "Lucknow, India and remote worldwide"
    }
  },
  production: {
    users: {
      admin: { email: "admin@cinegrafico.com", name: "Cinegrafico Admin", password: "change-me-admin" },
      editor: { email: "editor@cinegrafico.com", name: "Cinegrafico Editor", password: "change-me-editor" }
    },
    hero: {
      heading: "Cinematic stories that scale your brand.",
      subheading: "We produce premium video and motion work built for campaigns, launches, and digital growth.",
      ctaText: "Book a Discovery Call",
      videoUrl: ASSETS.heroVideo
    },
    about: {
      vision: ABOUT_VISION,
      style: ABOUT_STYLE,
      trust: ABOUT_TRUST
    },
    contact: {
      email: "hello@cinegrafico.com",
      phone: "+91 00000 00000",
      whatsapp: "+91 00000 00000",
      location: "Lucknow, India"
    }
  }
};

const SHARED_CONTENT = {
  services: [
    ["2D Animation", "Frame-by-frame and vector animation for explainers and social stories."],
    ["3D Animation", "Product visuals and cinematic scenes for premium brand moments."],
    ["Video Editing", "Pacing, rhythm, and finish across launch films and social cuts."],
    ["Motion Graphics", "Titles, transitions, and modern visual systems."],
    ["Photography", "Studio and lifestyle imagery crafted for campaigns."]
  ],
  clients: [
    ["client-seed-0", "Nike", ASSETS.clients.nike],
    ["client-seed-1", "Adidas", ASSETS.clients.adidas],
    ["client-seed-2", "Pepsi", ASSETS.clients.pepsi],
    ["client-seed-3", "Red Bull", ASSETS.clients.redbull],
    ["client-seed-4", "Spotify", ASSETS.clients.spotify],
    ["client-seed-5", "Samsung", ASSETS.clients.samsung]
  ],
  portfolioItems: [
    ["portfolio-seed-0", "Brand Launch Film", "A cinematic launch video crafted for social-first distribution.", ASSETS.portfolio.brandLaunch.video, ASSETS.portfolio.brandLaunch.poster, { projectType: "Films" }],
    ["portfolio-seed-1", "Product Hero Spot", "High-impact product storytelling with studio lighting and dynamic edits.", ASSETS.portfolio.productHero.video, ASSETS.portfolio.productHero.poster, { projectType: "Films" }],
    ["portfolio-seed-2", "Festival Recap", "Fast-paced recap edit mixing drone, handheld, and crowd energy.", ASSETS.portfolio.festivalRecap.video, ASSETS.portfolio.festivalRecap.poster, { projectType: "Films" }],
    ["portfolio-seed-3", "Corporate Profile", "Clean and premium profile film focused on team, process, and culture.", ASSETS.portfolio.corporateProfile.video, ASSETS.portfolio.corporateProfile.poster, { projectType: "Films" }],
    ["portfolio-seed-4", "Motion Identity Reel", "A short reel featuring logo animations and motion system exploration.", ASSETS.portfolio.motionIdentity.video, ASSETS.portfolio.motionIdentity.poster, { projectType: "Motion Graphics" }]
  ],
  teamMembers: [
    ["creative-director", "Creative Director", "The Creator", "Leads the visual language, story tone, and creative direction across campaigns."],
    ["head-of-production", "Head of Production", "The Architect", "Builds the execution blueprint from planning to delivery, ensuring quality at every stage."],
    ["cinematographer", "Cinematographer", "The Lens", "Designs camera movement and lighting to shape mood, emotion, and visual impact."],
    ["editor", "Editor", "The Rhythm", "Crafts pacing and emotional flow through structure, timing, and seamless transitions."],
    ["manager", "Project Manager", "The Operator", "Coordinates timelines, communication, and operations so projects move smoothly end-to-end."]
  ]
};

async function main() {
  const envKey = SEED_ENV === "production" ? "production" : "development";
  const dataset = DATASETS[envKey];

  const adminHash = await bcrypt.hash(dataset.users.admin.password, 10);
  const editorHash = await bcrypt.hash(dataset.users.editor.password, 10);

  await prisma.user.upsert({
    where: { email: dataset.users.admin.email },
    update: {},
    create: {
      email: dataset.users.admin.email,
      name: dataset.users.admin.name,
      passwordHash: adminHash,
      role: "ADMIN"
    }
  });

  await prisma.user.upsert({
    where: { email: dataset.users.editor.email },
    update: {},
    create: {
      email: dataset.users.editor.email,
      name: dataset.users.editor.name,
      passwordHash: editorHash,
      role: "EDITOR"
    }
  });

  await prisma.heroContent.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      heading: dataset.hero.heading,
      subheading: dataset.hero.subheading,
      ctaText: dataset.hero.ctaText,
      videoUrl: dataset.hero.videoUrl
    }
  });

  await prisma.aboutContent.upsert({
    where: { id: "singleton" },
    update: {
      vision: dataset.about.vision,
      style: dataset.about.style,
      trust: dataset.about.trust
    },
    create: {
      id: "singleton",
      vision: dataset.about.vision,
      style: dataset.about.style,
      trust: dataset.about.trust
    }
  });

  await prisma.contactContent.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      email: dataset.contact.email,
      phone: dataset.contact.phone,
      whatsapp: dataset.contact.whatsapp,
      location: dataset.contact.location
    }
  });

  await prisma.hiringContent.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      isVisible: false,
      roleTitle: "",
      profileDescription: "",
      whoCanApply: "",
      applyButtonLabel: "Apply",
      applyUrl: ""
    }
  });

  const serviceIds = [];
  for (let i = 0; i < SHARED_CONTENT.services.length; i += 1) {
    const [title, description] = SHARED_CONTENT.services[i];
    const id = `service-seed-${i}`;
    serviceIds.push(id);
    await prisma.service.upsert({
      where: { id },
      update: { title, description, position: i },
      create: { id, title, description, position: i }
    });
  }
  await prisma.service.deleteMany({
    where: { id: { startsWith: "service-seed-" }, NOT: { id: { in: serviceIds } } }
  });

  for (let i = 0; i < SHARED_CONTENT.clients.length; i += 1) {
    const [id, name, logoUrl] = SHARED_CONTENT.clients[i];
    await prisma.client.upsert({
      where: { id },
      update: { name, logoUrl, position: i },
      create: { id, name, logoUrl, position: i }
    });
  }

  for (let i = 0; i < SHARED_CONTENT.portfolioItems.length; i += 1) {
    const [id, title, description, videoUrl, posterUrl, tags] = SHARED_CONTENT.portfolioItems[i];
    await prisma.portfolioItem.upsert({
      where: { id },
      update: { title, description, videoUrl, posterUrl, tags, position: i },
      create: { id, title, description, videoUrl, posterUrl, tags, position: i }
    });
  }

  for (let i = 0; i < SHARED_CONTENT.teamMembers.length; i += 1) {
    const [slug, name, subtitle, description] = SHARED_CONTENT.teamMembers[i];
    await prisma.teamMember.upsert({
      where: { slug },
      update: { name, subtitle, description, position: i },
      create: { slug, name, subtitle, description, position: i }
    });
  }

  console.log(`Seed completed for "${envKey}": hero, services, clients, portfolio, and team populated.`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
