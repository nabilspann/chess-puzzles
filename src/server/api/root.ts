import { createTRPCRouter } from "~/server/api/trpc";
import { puzzlesRouter } from "./routers/puzzles";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  puzzles: puzzlesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
