import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const taskInput = z.object({
  title: z.string(),
  date: z.coerce.date(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  description: z.string(),
  assignedToId: z.string(),
});

export const adminTaskRouter = createTRPCRouter({
  create: protectedProcedure
    .input(taskInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { role: true, id: true },
      });
      if (user?.role !== "ADMIN") {
        throw new Error("Not authorized");
      }
      return await ctx.db.task.create({
        data: { ...input, createdById: user.id },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (user?.role !== "ADMIN") {
      throw new Error("Not authorized");
    }
    return await ctx.db.task.findMany({
      include: { createdBy: true, assignedTo: true },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user?.role !== "ADMIN") {
        throw new Error("Not authorized");
      }
      return await ctx.db.task.findUnique({
        where: { id: input.id },
        include: { createdBy: true, assignedTo: true },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: taskInput.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user?.role !== "ADMIN") {
        throw new Error("Not authorized");
      }
      return await ctx.db.task.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user?.role !== "ADMIN") {
        throw new Error("Not authorized");
      }
      return await ctx.db.task.delete({ where: { id: input.id } });
    }),
});
