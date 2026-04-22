import { z } from "zod";
import { createRouter, publicQuery, passwordQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { messages } from "@db/schema";
import { desc, eq } from "drizzle-orm";

export const messageRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(messages).orderBy(desc(messages.createdAt));
  }),

  create: passwordQuery
    .input(z.object({
      content: z.string().min(1).max(2000),
      authorName: z.string().min(1).max(255),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(messages).values({
        content: input.content,
        authorName: input.authorName,
        authorId: 0,
      });
      return { id: Number(result[0].insertId) };
    }),

  update: passwordQuery
    .input(z.object({
      id: z.number(),
      content: z.string().min(1).max(2000),
      authorName: z.string().min(1).max(255),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(messages).set({
        content: input.content,
        authorName: input.authorName,
      }).where(eq(messages.id, input.id));
      return { success: true };
    }),

  delete: passwordQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(messages).where(eq(messages.id, input.id));
      return { success: true };
    }),
});
