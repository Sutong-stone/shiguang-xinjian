import { z } from "zod";
import { createRouter, publicQuery, passwordQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { coverSettings } from "@db/schema";

export const coverRouter = createRouter({
  get: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(coverSettings).limit(1);
    if (rows.length === 0) {
      // Return default if none exists
      return { id: 0, imageUrl: "/images/hero-illustration.jpg", title: "拾光信笺", subtitle: "记录成长的每一刻", updatedAt: new Date() };
    }
    return rows[0];
  }),

  update: passwordQuery
    .input(z.object({
      imageUrl: z.string().optional(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(coverSettings).limit(1);
      if (rows.length === 0) {
        await db.insert(coverSettings).values({
          imageUrl: input.imageUrl || "/images/hero-illustration.jpg",
          title: input.title || "拾光信笺",
          subtitle: input.subtitle || "记录成长的每一刻",
        });
      } else {
        await db.update(coverSettings).set({
          ...input,
          updatedAt: new Date(),
        });
      }
      return { success: true };
    }),
});
