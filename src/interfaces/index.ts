import type { ChessInstance, Move, ShortMove } from "chess.js";
import { type RouterOutputs } from "~/utils/api";

export type SingleMove = ShortMove | string;
export type PuzzleData = RouterOutputs["puzzles"]["getOne"][number];
export type Difficulty = "easy" | "medium" | "hard";
export interface MoveResult {
  move: Move | null;
  gameCopy: ChessInstance;
}