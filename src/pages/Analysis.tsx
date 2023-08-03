import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import type { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import ChessBoardComp from "~/components/ChessBoard";
import type { PuzzleData } from "~/interfaces";

interface PropType {
    data: PuzzleData[];
    boardOrientation: BoardOrientation;
    anim: number;
}

const Analysis = ({data, boardOrientation, anim} : PropType) => {
    const [game, setGame] = useState(new Chess());
    console.log("Analysis data", data);
    useEffect(() => {
      const fen = data?.[0]?.fen;
      if (fen) {
        game.load(fen);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    return (
      <div className="p-5 pt-10 md:grid md:grid-cols-6">
        <div className="md:col-span-4 md:px-5">
          <ChessBoardComp
            boardOrientation={boardOrientation}
            animation={anim}
            game={game}
            mutateGame={(newGame) => setGame(newGame)}
          />
        </div>
      </div>
    );
}

export default Analysis;
