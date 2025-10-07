import dayjs from "dayjs";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const adminRouter = createTRPCRouter({
  getAllWorklogsForMonth: protectedProcedure
    .input(z.object({ year: z.number(), month: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user?.role !== "ADMIN") {
        throw new Error("Not authorized");
      }

      const startDate = dayjs()
        .year(input.year)
        .month(input.month - 1)
        .date(1)
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();
      const endDate = dayjs()
        .year(input.year)
        .month(input.month)
        .date(0)
        .hour(23)
        .minute(59)
        .second(59)
        .millisecond(999)
        .toDate();
      return ctx.db.workLog.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          createdBy: true,
        },
      });
    }),

  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (user?.role !== "ADMIN") {
      throw new Error("Not authorized");
    }
    return ctx.db.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });
  }),
});
