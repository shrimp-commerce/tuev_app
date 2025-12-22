import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export const userTaskRouter = createTRPCRouter({
  getAllForDay: protectedProcedure
    .input(z.object({ date: z.coerce.date() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const startOfDay = dayjs(input.date).utc().startOf("day").toDate();
      const endOfDay = dayjs(input.date).utc().endOf("day").toDate();
      const tasks = await ctx.db.task.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          assignedToId: userId,
        },
        include: { createdBy: true, assignedTo: true },
      });
      return tasks;
    }),

  getAllForWeek: protectedProcedure
    .input(z.object({ date: z.coerce.date(), offset: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
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
          assignedToId: userId,
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
});
