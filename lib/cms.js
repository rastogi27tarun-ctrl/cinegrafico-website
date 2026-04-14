import { db } from "@/lib/db";

export async function getPublicCmsData() {
  const [hero, about, contact, services, portfolio, clients, teamMembers] = await Promise.all([
    db.heroContent.findUnique({ where: { id: "singleton" } }),
    db.aboutContent.findUnique({ where: { id: "singleton" } }),
    db.contactContent.findUnique({ where: { id: "singleton" } }),
    db.service.findMany({ orderBy: { position: "asc" } }),
    db.portfolioItem.findMany({ orderBy: { position: "asc" } }),
    db.client.findMany({ orderBy: { position: "asc" } }),
    db.teamMember.findMany({ orderBy: { position: "asc" } })
  ]);

  return { hero, about, contact, services, portfolio, clients, teamMembers };
}
