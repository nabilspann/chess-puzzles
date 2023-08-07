import type { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { BLACK, WHITE } from "~/utils/constants";

interface PgnMove {
  white: string | null,
  black: string | null
}

interface FocusMoveObj {
  moveNumber: number,
  turn: BoardOrientation
}

type FocusMove = FocusMoveObj | null;

interface PropType {
  pgn?: PgnMove[],
  focusMove?: FocusMove
}

const moveClass = (focusMove: FocusMove, turn: BoardOrientation, moveNumber: number) => {
  const baseClass =
    "w-32 flex-auto border-l-2 border-gray-200 pl-3 text-black";
  if(focusMove?.turn === turn && focusMove.moveNumber === moveNumber){
    return baseClass + " bg-slate-300";
  }
  return baseClass + " bg-white";
};
const Annotation = ({ pgn = [], focusMove = null }: PropType) => {

  if(pgn.length === 0){
    return(
        <div className="h-18 max-w-sm bg-white">
    {
      [1, 2, 3].map((eachIndex) => (
        <div key={eachIndex + 1} className="flex">
          <div className="w-12 flex-none bg-slate-400 text-center">
            {eachIndex}
          </div>
        </div>
      ))
    }
        </div>
    )
  }

  return (
    <div className="max-w-sm bg-white">
      {pgn.map((eachMove, index) => {
        const whiteMove = eachMove.white || "...";
        const blackMove = eachMove.black || "...";

        return (
          <div key={`${whiteMove}${blackMove}`} className="flex">
            <div className="w-12 flex-none bg-slate-400 text-center">
              {index + 1}
            </div>
            <div className={moveClass(focusMove, WHITE, index)}>
              {whiteMove}
            </div>
            <div className={moveClass(focusMove, BLACK, index)}>
              {eachMove.black}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Annotation;
