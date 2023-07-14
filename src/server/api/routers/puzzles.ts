import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const puzzlesRouter = createTRPCRouter({
  getOne: publicProcedure
  .input(z.object({difficulty: z.string()}))
  .query(async ({ ctx, input }) => {
    const count = await ctx.prisma.puzzle.count({
      where: { difficulty: input.difficulty },
    });
    const skip = Math.floor(Math.random() * count);

    return ctx.prisma.puzzle.findMany({
      skip,
      take: 1,
      where: { difficulty: input.difficulty },
    });
  }),
});
