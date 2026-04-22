import { z } from "zod";
import { createRouter, publicQuery, passwordQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { albums } from "@db/schema";
import { desc } from "drizzle-orm";

export const albumRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(albums).orderBy(desc(albums.createdAt));
  }),

  create: passwordQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        imageUrl: z.string().min(1),
        date: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(albums).values({
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        date: input.date,
        category: input.category,
      });
      return { id: Number(result[0].insertId) };
    }),
});
