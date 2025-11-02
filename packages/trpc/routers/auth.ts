import { TRPCError } from "@trpc/server";

import { publicProcedure, createTRPCRouter } from "../lib";

export const authRouter = createTRPCRouter({
  getUser: publicProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.usersTable.findFirst({
      where: (usersTable, { eq }) => eq(usersTable.id, 1),
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
