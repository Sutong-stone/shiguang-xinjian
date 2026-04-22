import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { env } from "./lib/env";

export const passwordRouter = createRouter({
  verify: publicQuery
    .input(
      z.object({
        password: z.string().min(1),
      })
    )
    .mutation(({ input }) => {
      if (input.password !== env.sitePassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "密码不正确",
        });
      }
      return {
        token: env.sitePassword,
        message: "验证成功",
      };
    }),
});
