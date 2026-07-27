import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const beanRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.bean.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  create: publicProcedure
    .input(
      z.object({
        name:       z.string().min(1, "กรุณาระบุชื่อเมล็ดกาแฟ"),
        roaster:    z.string().min(1, "กรุณาระบุชื่อโรงคั่ว"),
        roastLevel: z.enum(["LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"]),
        process:    z.enum(["WASHED", "NATURAL", "HONEY", "ANAEROBIC", "OTHER"]),
        tasteNotes: z.string().optional(),
        weight:     z.number().positive(),
        price:      z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.bean.create({ data: input });
    }),

  update: publicProcedure
    .input(
      z.object({
        id:         z.string(),
        name:       z.string().min(1).optional(),
        roaster:    z.string().min(1).optional(),
        roastLevel: z.enum(["LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"]).optional(),
        process:    z.enum(["WASHED", "NATURAL", "HONEY", "ANAEROBIC", "OTHER"]).optional(),
        tasteNotes: z.string().optional(),
        weight:     z.number().positive().optional(),
        price:      z.number().positive().optional(),
        isFinished: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.bean.update({ where: { id }, data });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.bean.delete({ where: { id: input.id } });
    }),
});