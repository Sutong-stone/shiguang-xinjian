import { z } from "zod";
import { createRouter, publicQuery, passwordQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { albums } from "@db/schema";
import { desc, eq } from "drizzle-orm";

export const albumRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(albums).orderBy(desc(albums.createdAt));
  }),

  create: passwordQuery
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      imageUrl: z.string().min(1),
      isVideo: z.number().optional(),
      date: z.string().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(albums).values({
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        isVideo: input.isVideo || 0,
        date: input.date,
        category: input.category,
      });
      return { id: Number(result[0].insertId) };
    }),

  update: passwordQuery
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      date: z.string().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db.update(albums).set(updates).where(eq(albums.id, id));
      return { success: true };
    }),

  delete: passwordQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(albums).where(eq(albums.id, input.id));
      return { success: true };
    }),
});
