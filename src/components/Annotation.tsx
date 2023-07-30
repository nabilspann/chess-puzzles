import { useEffect, useState } from "react";
import type { SingleMove } from "~/interfaces";

interface PgnMove {
  white: string | null,
  black: string | null
}

// interface AnnotationMove {
//   move: string;
//   boardOrientation: BoardOrientation;
// }

interface PropType {
  pgn?: PgnMove[],
  // pushMove: AnnotationMove[]
}

const Annotation = ({ pgn = []}: PropType) => {
  // const [pgn, setPgn] = useState(initialPgn);

  // useEffect(() => {
    
  //       console.log("pushMove", pushMove);
  //   if(pushMove) {
  //       const newPgn = [ ...pgn ];
  //       const arrLength = newPgn.length;
  //       // if (arrLength === 0 || !!newPgn[arrLength - 1]?.black) {
  //       //   newPgn.push({
  //       //     white: pushMove,
  //       //     black: null,
  //       //   });
  //       //   setPgn(newPgn);
  //       // }
  //       // else if (newPgn[arrLength - 1]?.white !== undefined ) {
  //       //   console.log("newPgn[arrLength - 1]", newPgn[arrLength - 1]);
  //       //   newPgn[arrLength - 1] = { ...newPgn[arrLength - 1], black: pushMove };
  //       //   setPgn(newPgn);
  //       // }
  //       // if (arrLength === 0 || pushMove.boardOrientation ) {
  //       //   newPgn.push({
  //       //     white: pushMove,
  //       //     black: null,
  //       //   });
  //       //   setPgn(newPgn);
  //       // } else if (newPgn[arrLength - 1]?.white !== undefined) {
  //       //   console.log("newPgn[arrLength - 1]", newPgn[arrLength - 1]);
  //       //   newPgn[arrLength - 1] = { ...newPgn[arrLength - 1], black: pushMove };
  //       //   setPgn(newPgn);
  //       // }
  //   }
  // }, [pushMove]);
  console.log("pgn", pgn);
  return (
    <div className="max-w-sm">
      {pgn.map((eachMove, index) => {
        console.log("eachMOve", eachMove)
        const whiteMove = eachMove.white || "...";
        const blackMove = eachMove.black || "...";
        console.log("whiemove", whiteMove);
        console.log("blackmove", blackMove);

        return (
          <div key={`${whiteMove}${blackMove}`} className="flex">
            <div className="w-12 flex-none bg-slate-400 text-center">
              {index + 1}
            </div>
            <div className="w-32 flex-auto border-l-2 border-gray-200 bg-white pl-3 text-black">
              {whiteMove}
            </div>
            <div className="w-32 flex-auto border-l-2 border-gray-200 bg-white pl-3 text-black">
              {eachMove.black}
            </div>
          </div>
        );})}
    </div>
  );
};

export default Annotation;
