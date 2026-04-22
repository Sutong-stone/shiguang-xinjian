import { authRouter } from "./auth-router";
import { passwordRouter } from "./password-router";
import { messageRouter } from "./message-router";
import { albumRouter } from "./album-router";
import { milestoneRouter } from "./milestone-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  password: passwordRouter,
  message: messageRouter,
  album: albumRouter,
  milestone: milestoneRouter,
});

export type AppRouter = typeof appRouter;
