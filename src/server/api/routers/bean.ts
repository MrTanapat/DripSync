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
        weight:     z.number().positive("น้ำหนักต้องมากกว่า 0"),
        price:      z.number().positive("ราคาต้องมากกว่า 0"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.bean.create({ data: input });
    }),
});