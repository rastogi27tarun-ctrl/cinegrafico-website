import { db } from "./db";
import { unstable_noStore as noStore } from "next/cache";

export async function getContent() {
  noStore();
  const [hero, about, contact, hiring, services, portfolio, clients, teamMembers] = await Promise.all([
    db.heroContent.findUnique({ where: { id: "singleton" } }),
    db.aboutContent.findUnique({ where: { id: "singleton" } }),
    db.contactContent.findUnique({ where: { id: "singleton" } }),
    db.hiringContent.findUnique({ where: { id: "singleton" } }),
    db.service.findMany({ orderBy: { position: "asc" } }),
    db.portfolioItem.findMany({ orderBy: { position: "asc" } }),
    db.client.findMany({ orderBy: { position: "asc" } }),
    db.teamMember.findMany({ orderBy: { position: "asc" } })
  ]);

  return { hero, about, contact, hiring, services, portfolio, clients, teamMembers };
}

export const getPublicCmsData = getContent;
