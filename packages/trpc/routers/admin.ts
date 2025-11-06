import { z } from "zod/v4";

import { TRPCError } from "@trpc/server";
import { userRepository } from "@repo/repositories";
import { createTRPCRouter, adminProcedure } from "../lib";

export const adminRouter = createTRPCRouter({
  getUsers: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(0).default(0),
        limit: z.number().int().min(1).max(100).default(10),
        search: z.string().optional(),
        role: z.enum(["user", "admin"]).optional(),
        status: z.enum(["verified", "unverified", "banned"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await userRepository.getUsers(ctx.database, input);
    }),

  getUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await userRepository.getUser(ctx.database, input);
    }),
  updateUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        data: z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          role: z.enum(["user", "admin"]).optional(),
          banned: z.boolean().optional(),
          banReason: z.string().optional(),
          banExpires: z.date().optional(),
          verified: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await userRepository.updateUser(ctx.database, {
        userId: input.userId,
        currentUserId: ctx.auth.user.id,
        data: input.data,
      });
    }),

  banUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await userRepository.banUser(ctx.database, {
        userId: input.userId,
        currentUserId: ctx.auth.user.id,
        reason: input.reason,
        expiresAt: input.expiresAt,
      });
    }),

  unbanUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await userRepository.unbanUser(ctx.database, input);
    }),
  deleteUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await userRepository.deleteUser(ctx.database, {
        userId: input.userId,
        currentUserId: ctx.auth.user.id,
      });
    }),
  bulkBanUsers: adminProcedure
    .input(
      z.object({
        userIds: z.array(z.string()).min(1),
        reason: z.string().optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Filter out protected users (admins and self)
      const { validUserIds, skippedCount } =
        await userRepository.filterProtectedUsers(
          ctx.database,
          input.userIds,
          ctx.auth.user.id
        );

      if (validUserIds.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No valid users to ban (all selected users are protected)",
        });
      }

      const affectedCount = await userRepository.bulkBanUsers(ctx.database, {
        userIds: validUserIds,
        reason: input.reason,
        expiresAt: input.expiresAt,
      });

      return {
        success: true,
        affectedCount,
        skippedCount,
      };
    }),

  bulkDeleteUsers: adminProcedure
    .input(
      z.object({
        userIds: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Filter out protected users (admins and self)
      const { validUserIds, skippedCount } =
        await userRepository.filterProtectedUsers(
          ctx.database,
          input.userIds,
          ctx.auth.user.id
        );

      if (validUserIds.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "No valid users to delete (all selected users are protected)",
        });
      }

      const affectedCount = await userRepository.bulkDeleteUsers(ctx.database, {
        userIds: validUserIds,
      });

      return {
        success: true,
        affectedCount,
        skippedCount,
      };
    }),
  bulkUpdateUserRoles: adminProcedure
    .input(
      z.object({
        userIds: z.array(z.string()).min(1),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Filter out protected users (admins and self)
      const { validUserIds, skippedCount } =
        await userRepository.filterProtectedUsers(
          ctx.database,
          input.userIds,
          ctx.auth.user.id
        );

      if (validUserIds.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "No valid users to update (all selected users are protected)",
        });
      }

      const affectedCount = await userRepository.bulkUpdateUserRoles(
        ctx.database,
        {
          userIds: validUserIds,
          role: input.role,
        }
      );

      return {
        success: true,
        affectedCount,
        skippedCount,
      };
    }),

  createWorkflow: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        metadata: z.record(z.string(), z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.workflows.ExampleWorkflow.create({
        params: {
          email: input.email,
          metadata: input.metadata,
        },
      });
    }),
});
