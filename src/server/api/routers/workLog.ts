import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const workLogRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        description: z.string().min(1),
        date: z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: "Invalid date format",
        }),
        startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: "Invalid startTime format",
        }),
        endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: "Invalid endTime format",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.workLog.create({
        data: {
          date: new Date(input.date),
          startTime: new Date(input.startTime),
          endTime: new Date(input.endTime),
          description: input.description,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const workLog = await ctx.db.workLog.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });

    return workLog ?? null;
  }),
});
