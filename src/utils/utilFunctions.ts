import type { SingleMove, PuzzleData, MoveResult } from "~/interfaces";
import { WHITE, BLACK } from "./constants";
import { type ChessInstance } from "chess.js";

export const getOrientation = (puzzleData: PuzzleData) => {
  return puzzleData.fen.includes("w") ? WHITE : BLACK;
};

export const makeAMove = (nextMove: SingleMove, game: ChessInstance): MoveResult => {
  const gameCopy = { ...game };
  const move = gameCopy.move(nextMove);
  return { move, gameCopy };
};
