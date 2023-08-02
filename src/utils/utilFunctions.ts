import { type PuzzleData } from "~/interfaces";
import { WHITE, BLACK } from "./constants";

export const getOrientation = (puzzleData: PuzzleData) => {
  return puzzleData.fen.includes("w") ? WHITE : BLACK;
};
