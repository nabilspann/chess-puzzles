import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


let currentID = ''
export const puzzlesRouter = createTRPCRouter({
  getOne: publicProcedure
  .input(z.object({difficulty: z.string()}))
  .query(async ({ ctx, input }) => {
    const count = await ctx.prisma.puzzle.count({
      where: { difficulty: input.difficulty },
    });
    const skip = Math.floor(Math.random() * (count-1));

    let res = await ctx.prisma.puzzle.findMany({
      skip,
      take: 1,
      where: { 
        difficulty: input.difficulty,
        id: { not: currentID }
      }
    })
    currentID = res?.[0]?.id || ''

    return res
  }),
});
