import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const brewRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      return ctx.db.brewLog.findMany({
        include: { bean: { select: { name: true, roaster: true } } },
        orderBy: { createdAt: "desc" },
      });
    }
    return ctx.db.brewLog.findMany({
      where: { bean: { userId: ctx.session.user.id } },
      include: { bean: { select: { name: true, roaster: true } } },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
  .input(
    z.object({
      beanId:     z.string(),
      coffeeDose: z.number().positive(),
      waterYield: z.number().positive(),
      waterTemp:  z.number().positive(),
      grindSize:  z.string().min(1, "กรุณาระบุเบอร์บด"),
      pours:      z.array(z.number().int().nonnegative()).default([]),
      pourGrams:  z.array(z.number().nonnegative()).default([]),  // เพิ่ม
      brewTime:   z.number().int().positive(),
      method:     z.string().min(1, "กรุณาระบุวิธีดริป"),
      brewDate:   z.coerce.date(),
      rating:     z.number().int().min(1).max(5),
      notes:      z.string().optional(),
    })
  )
    .mutation(async ({ ctx, input }) => {
      const bean = await ctx.db.bean.findFirst({
        where: { id: input.beanId, userId: ctx.session.user.id },
      });
      if (!bean) {
        throw new TRPCError({ code: "NOT_FOUND", message: "ไม่พบเมล็ดกาแฟนี้" });
      }

      if (input.coffeeDose > bean.weight) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `เมล็ดกาแฟคงเหลือแค่ ${bean.weight}g ไม่พอสำหรับการชง ${input.coffeeDose}g`,
        });
      }

      const remainingWeight = Math.max(0, bean.weight - input.coffeeDose);

      const [brewLog] = await ctx.db.$transaction([
        ctx.db.brewLog.create({ data: input }),
        ctx.db.bean.update({
          where: { id: bean.id },
          data: {
            weight: remainingWeight,
            isFinished: remainingWeight <= 0 ? true : bean.isFinished,
          },
        }),
      ]);

      return brewLog;
    }),

  update: protectedProcedure
  .input(
    z.object({
      id:         z.string(),
      beanId:     z.string().optional(),
      coffeeDose: z.number().positive().optional(),
      waterYield: z.number().positive().optional(),
      waterTemp:  z.number().positive().optional(),
      grindSize:  z.string().min(1).optional(),
      pours:      z.array(z.number().int().nonnegative()).optional(),
      pourGrams:  z.array(z.number().nonnegative()).optional(),  // เพิ่ม
      brewTime:   z.number().int().positive().optional(),
      method:     z.string().min(1).optional(),
      brewDate:   z.coerce.date().optional(),
      rating:     z.number().int().min(1).max(5).optional(),
      notes:      z.string().optional(),
    })
  )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.brewLog.findFirst({
        where: { id, bean: { userId: ctx.session.user.id } },
        select: { id: true },
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "ไม่พบบันทึกการชงนี้" });
      }

      if (data.beanId) {
        const bean = await ctx.db.bean.findFirst({
          where: { id: data.beanId, userId: ctx.session.user.id },
          select: { id: true },
        });
        if (!bean) {
          throw new TRPCError({ code: "NOT_FOUND", message: "ไม่พบเมล็ดกาแฟนี้" });
        }
      }

      return ctx.db.brewLog.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const brewLog = await ctx.db.brewLog.findFirst({
        where: { id: input.id, bean: { userId: ctx.session.user.id } },
        select: { id: true },
      });
      if (!brewLog) {
        throw new TRPCError({ code: "NOT_FOUND", message: "ไม่พบบันทึกการชงนี้" });
      }
      return ctx.db.brewLog.delete({ where: { id: input.id } });
    }),
});
