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
      const startOfDay = dayjs(input.date).utc().startOf("day").toDate();
      const endOfDay = dayjs(input.date).utc().endOf("day").toDate();
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

  getAllForWeek: protectedProcedure
    .input(z.object({ date: z.coerce.date(), offset: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user?.role !== "ADMIN") {
        throw new Error("Not authorized");
      }
      const offset = input.offset ?? 0;
      let inputDay = dayjs(input.date).utc();
      if (offset !== 0) {
        inputDay = inputDay.add(offset, "week");
      }
      const dayOfWeek = inputDay.day();
      const monday = inputDay
        .subtract((dayOfWeek + 6) % 7, "day")
        .startOf("day");
      const sunday = monday.add(6, "day").endOf("day");

      const startOfWeek = monday.toDate();
      const endOfWeek = sunday.toDate();

      const tasks = await ctx.db.task.findMany({
        where: {
          date: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
        include: { createdBy: true, assignedTo: true },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      });

      const daysOfWeek = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
      const grouped: Record<string, typeof tasks> = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      };

      tasks.forEach((task) => {
        const day = dayjs(task.date).utc().day();
        const key = daysOfWeek[(day + 6) % 7];
        if (key && grouped[key]) {
          grouped[key].push(task);
        }
      });

      return grouped;
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
