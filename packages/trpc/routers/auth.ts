import { TRPCError } from "@trpc/server";

import { publicProcedure, createTRPCRouter } from "../lib";
import { userRepository } from "@repo/repositories";
import z from "zod";

export const authRouter = createTRPCRouter({
  getUser: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await userRepository.getUser(ctx.database, {
        id: input.id,
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return {
        id: user?.id,
        name: user?.name,
      };
    }),
});
