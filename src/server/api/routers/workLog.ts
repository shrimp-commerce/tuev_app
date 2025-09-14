import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const workLogRouter = createTRPCRouter({
  getByMonth: protectedProcedure
    .input(
      z.object({
        year: z.number().int().min(1970),
        month: z.number().int().min(1).max(12),
      }),
    )
    .query(async ({ ctx, input }) => {
      const start = new Date(Date.UTC(input.year, input.month - 1, 1, 0, 0, 0));
      const end = new Date(Date.UTC(input.year, input.month, 1, 0, 0, 0));
      return ctx.db.workLog.findMany({
        where: {
          createdBy: { id: ctx.session.user.id },
          date: {
            gte: start,
            lt: end,
          },
        },
        orderBy: { date: "desc" },
      });
    }),

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

  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        description: z.string().min(1).optional(),
        date: z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid date format",
          })
          .optional(),
        startTime: z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid startTime format",
          })
          .optional(),
        endTime: z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), {
            message: "Invalid endTime format",
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, date, startTime, endTime, description } = input;
      const updateData: {
        date?: Date;
        startTime?: Date;
        endTime?: Date;
        description?: string;
      } = {};
      if (date) updateData.date = new Date(date);
      if (startTime) updateData.startTime = new Date(startTime);
      if (endTime) updateData.endTime = new Date(endTime);
      if (description) updateData.description = description;
      return ctx.db.workLog.update({
        where: {
          id,
          createdById: ctx.session.user.id,
        },
        data: updateData,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.workLog.delete({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
      });
    }),
});
