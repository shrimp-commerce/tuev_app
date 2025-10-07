import { z } from "zod";

import dayjs from "dayjs";
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
      const start = dayjs
        .utc()
        .year(input.year)
        .month(input.month - 1)
        .date(1)
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();
      const end = dayjs
        .utc()
        .year(input.year)
        .month(input.month)
        .date(1)
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();
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
        date: z.string().refine((val) => dayjs(val).isValid(), {
          message: "Invalid date format",
        }),
        startTime: z.string().refine((val) => dayjs(val).isValid(), {
          message: "Invalid startTime format",
        }),
        endTime: z.string().refine((val) => dayjs(val).isValid(), {
          message: "Invalid endTime format",
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.workLog.create({
        data: {
          date: dayjs(input.date).toDate(),
          startTime: dayjs(input.startTime).toDate(),
          endTime: dayjs(input.endTime).toDate(),
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
          .refine((val) => dayjs(val).isValid(), {
            message: "Invalid date format",
          })
          .optional(),
        startTime: z
          .string()
          .refine((val) => dayjs(val).isValid(), {
            message: "Invalid startTime format",
          })
          .optional(),
        endTime: z
          .string()
          .refine((val) => dayjs(val).isValid(), {
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
      if (date) updateData.date = dayjs(date).toDate();
      if (startTime) updateData.startTime = dayjs(startTime).toDate();
      if (endTime) updateData.endTime = dayjs(endTime).toDate();
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
