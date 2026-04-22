import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { milestones } from "@db/schema";
import { desc } from "drizzle-orm";

export const milestoneRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(milestones).orderBy(desc(milestones.createdAt));
  }),

  create: publicQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        date: z.string().min(1),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(milestones).values({
        title: input.title,
        description: input.description,
        date: input.date,
        icon: input.icon || "star",
      });
      return { id: Number(result[0].insertId) };
    }),
});
