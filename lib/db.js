import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis;

export const db = globalForPrisma.db || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.db = db;
