import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

function createPrismaClient() {
  return new PrismaClient();
}

function getPrismaClient() {
  const cached = globalForPrisma.db;
  // In dev, Next.js can keep an old PrismaClient in memory after schema changes.
  if (cached && typeof cached.contactInquiry !== "undefined") {
    return cached;
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.db = client;
  }
  return client;
}

export const db = getPrismaClient();
export default db;
