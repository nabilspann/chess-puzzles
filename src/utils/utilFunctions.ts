import { type PuzzleData } from "~/interfaces";
import { WHITE, BLACK } from "./contants";

export const getOrientation = (puzzleData: PuzzleData) => {
  return puzzleData.fen.includes("w") ? WHITE : BLACK;
};
