import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const taskInput = z.object({
  title: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
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
      // Normalize date to UTC midnight using dayjs
      const utcMidnight = dayjs(input.date).utc().startOf("day").toDate();
      return await ctx.db.task.create({
        data: { ...input, date: utcMidnight, createdById: user.id },
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

  getAllForDay: protectedProcedure
    .input(z.object({ date: z.coerce.date() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user?.role !== "ADMIN") {
        throw new Error("Not authorized");
      }
      console.log("input.date", input.date);
      const startOfDay = dayjs(input.date).utc().startOf("day").toDate();
      const endOfDay = dayjs(input.date).utc().endOf("day").toDate();
      console.log("startOfDay", startOfDay);
      console.log("endOfDay", endOfDay);
      const tasks = await ctx.db.task.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: { createdBy: true, assignedTo: true },
      });
      return tasks;
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
