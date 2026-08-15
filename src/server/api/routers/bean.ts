import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const beanRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      return ctx.db.bean.findMany({ orderBy: { createdAt: "desc" } });
    }
    return ctx.db.bean.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  getStats: publicProcedure.query(async ({ ctx }) => {
    const where = ctx.session?.user?.id
      ? { userId: ctx.session.user.id }
      : {};
    const beans = await ctx.db.bean.findMany({
      where,
      select: { weight: true, isFinished: true },
    });
    const totalWeight = beans.reduce((sum, b) => sum + b.weight, 0);
    const totalBeans = beans.length;
    const lowStock = beans.filter((b) => !b.isFinished && b.weight < 50).length;
    const outOfStock = beans.filter((b) => b.isFinished).length;
    return { totalWeight, totalBeans, lowStock, outOfStock };
  }),

  create: protectedProcedure
    .input(
      z.object({
        name:       z.string().min(1, "กรุณาระบุชื่อเมล็ดกาแฟ"),
        roaster:    z.string().min(1, "กรุณาระบุชื่อโรงคั่ว"),
        roastDate:  z.coerce.date(),
        roastLevel: z.enum(["LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"]),
        process:    z.enum(["WASHED", "NATURAL", "HONEY", "ANAEROBIC", "OTHER"]),
        tasteNotes: z.string().optional(),
        weight:     z.number().positive(),
        price:      z.number().positive(),
        imageUrl:   z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.bean.create({
        data: { ...input, userId: ctx.session.user.id },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id:         z.string(),
        name:       z.string().min(1).optional(),
        roaster:    z.string().min(1).optional(),
        roastDate:  z.coerce.date().optional(),
        roastLevel: z.enum(["LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"]).optional(),
        process:    z.enum(["WASHED", "NATURAL", "HONEY", "ANAEROBIC", "OTHER"]).optional(),
        tasteNotes: z.string().optional(),
        weight:     z.number().positive().optional(),
        price:      z.number().positive().optional(),
        imageUrl:   z.string().optional(),
        isFinished: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.bean.update({
        where: { id, userId: ctx.session.user.id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.bean.delete({
        where: { id: input.id, userId: ctx.session.user.id },
      });
    }),
});