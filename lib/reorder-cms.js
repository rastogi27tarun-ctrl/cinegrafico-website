/**
 * Persist display order for CMS list resources (position 0 = first).
 * @param {import("@prisma/client").PrismaClient} db
 * @param {{ findMany: Function, update: Function }} model
 * @param {string[]} ids
 */
export async function applyCmsOrder(db, model, ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("ids must be a non-empty array");
  }
  if (!ids.every((id) => typeof id === "string" && id.length > 0)) {
    throw new Error("ids must be strings");
  }

  const existing = await model.findMany({ select: { id: true } });
  const existingIds = new Set(existing.map((row) => row.id));

  if (ids.length !== existingIds.size) {
    throw new Error("ids must include every item exactly once");
  }
  if (ids.some((id) => !existingIds.has(id))) {
    throw new Error("unknown id in ids");
  }

  await db.$transaction(
    ids.map((id, position) => model.update({ where: { id }, data: { position } }))
  );
}
