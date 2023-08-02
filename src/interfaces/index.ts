import type { ShortMove } from "chess.js";
import { type RouterOutputs } from "~/utils/api";
import { type getOrientation } from "~/utils/utilFunctions";

export type SingleMove = ShortMove | string;
export type PuzzleData = RouterOutputs["puzzles"]["getOne"][number];
export type BoardOrientation = ReturnType<typeof getOrientation>;
export type Difficulty = "easy" | "medium" | "hard";
