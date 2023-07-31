import { useEffect, useState } from "react";
import type { SingleMove } from "~/interfaces";

interface PgnMove {
  white: string | null,
  black: string | null
}

interface PropType {
  pgn?: PgnMove[],
}

const moveClass = "w-32 flex-auto border-l-2 border-gray-200 bg-white pl-3 text-black";
const Annotation = ({ pgn = []}: PropType) => {
  console.log("pgn", pgn);

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
            <div className={moveClass}>
              {whiteMove}
            </div>
            <div className={moveClass}>
              {eachMove.black}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Annotation;
