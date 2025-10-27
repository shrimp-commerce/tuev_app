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
});
