import { z } from "zod/v4";

import { userRepository } from "@repo/repositories";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../lib";
import { user } from "@repo/db/schema";

export const userRouter = createTRPCRouter({
  // Public endpoint - anyone can view users
  getUsers: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.database.query.user.findMany({
      limit: 100,
    });
    return result;
  }),

  // Protected endpoint - requires authentication
  getUsersProtected: protectedProcedure.query(async ({ ctx }) => {
    const result = await userRepository.getUsers(ctx.database, {
      page: 0,
      limit: 100,
    });
    return result.users;
  }),

  // Protected endpoint - requires authentication to delete
  deleteUser: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await userRepository.deleteUser(ctx.database, {
        userId: input,
        currentUserId: ctx.auth.user.id,
      });
    }),
});
