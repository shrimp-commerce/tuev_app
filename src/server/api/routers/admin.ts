import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const adminRouter = createTRPCRouter({
  getAllWorklogsForMonth: protectedProcedure
    .input(z.object({ year: z.number(), month: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.isAdmin) {
        throw new Error("Not authorized");
      }

      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 0, 23, 59, 59, 999);
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
});
