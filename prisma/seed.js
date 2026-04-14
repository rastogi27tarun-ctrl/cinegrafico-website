const { PrismaClient } = require("../generated/prisma");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("admin12345", 10);
  const editorHash = await bcrypt.hash("editor12345", 10);

  await prisma.user.upsert({
    where: { email: "admin@cinegrafico.local" },
    update: {},
    create: {
      email: "admin@cinegrafico.local",
      name: "Admin User",
      passwordHash: adminHash,
      role: "ADMIN"
    }
  });

  await prisma.user.upsert({
    where: { email: "editor@cinegrafico.local" },
    update: {},
    create: {
      email: "editor@cinegrafico.local",
      name: "Editor User",
      passwordHash: editorHash,
      role: "EDITOR"
    }
  });

  await prisma.heroContent.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      heading: "Make your brand feel like a movie.",
      subheading: "Cinegrafico Studios crafts premium visuals, identity, and motion with cinematic precision.",
      ctaText: "Start a Project",
      videoUrl: "/assets/hero-backdrop.mp4"
    }
  });

  await prisma.aboutContent.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      vision: "Design the frame. Move the audience.",
      style: "Premium cinematic with minimal noise.",
      trust: "Reliable creative partner from concept to final delivery."
    }
  });

  await prisma.contactContent.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      email: "cinegraficostudios@gmail.com",
      phone: "+91 00000 00000",
      whatsapp: "+91 00000 00000",
      location: "Lucknow, India and remote worldwide"
    }
  });

  const services = [
    ["2D Animation", "Frame-by-frame and vector animation for explainers and social stories."],
    ["3D Animation", "Product visuals and cinematic scenes for premium brand moments."],
    ["Video Editing", "Pacing, rhythm, and finish across launch films and social cuts."],
    ["Motion Graphics", "Titles, transitions, and modern visual systems."],
    ["Photography", "Studio and lifestyle imagery crafted for campaigns."],
    ["Cinematography", "Camera and lighting direction built for visual impact."]
  ];

  for (let i = 0; i < services.length; i += 1) {
    const [title, description] = services[i];
    await prisma.service.upsert({
      where: { id: `service-seed-${i}` },
      update: { title, description, position: i },
      create: { id: `service-seed-${i}`, title, description, position: i }
    });
  }

  const teamMembers = [
    ["creative-director", "Creative Director", "", "Leads the visual language, story tone, and creative direction across campaigns."],
    ["head-of-production", "Head of Production", "The Architect", "Builds the execution blueprint from planning to delivery, ensuring quality at every stage."],
    ["photographer", "Photographer", "The eye", "Shapes light, framing, and still moments that carry cinematic depth and brand personality."],
    ["manager", "Manager", "The Operator", "Coordinates timelines, communication, and operations so projects move smoothly end-to-end."]
  ];

  for (let i = 0; i < teamMembers.length; i += 1) {
    const [slug, name, subtitle, description] = teamMembers[i];
    await prisma.teamMember.upsert({
      where: { slug },
      update: { name, subtitle, description, position: i },
      create: { slug, name, subtitle, description, position: i }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
