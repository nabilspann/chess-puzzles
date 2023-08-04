import { Chess } from "chess.js";
import { useEffect, useMemo, useState } from "react";
import type { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import ChessBoardComp from "~/components/ChessBoard";
import type { PuzzleData } from "~/interfaces";
import { WHITE, BLACK } from "~/utils/constants";
import { formatPgn, makeAMove } from "~/utils/utilFunctions";

interface PropType {
    data: PuzzleData[];
    boardOrientation: BoardOrientation;
    anim: number;
}

const Analysis = ({data, boardOrientation, anim} : PropType) => {
    const [game, setGame] = useState(new Chess());
    const [currentMove, setCurrentMove] = useState({ moveCount: 0, boardOrientation });
    console.log("boardOrientation", currentMove);
    useEffect(() => {
      const fen = data?.[0]?.fen;
      if (fen) {
        game.load(fen);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);
    
    useEffect(() => {
      setCurrentMove({ ...currentMove, boardOrientation });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boardOrientation])

    const puzzleData = data?.[0];
    const formattedPgn = useMemo(
      () => formatPgn(puzzleData?.pgn || ""),
      [puzzleData?.pgn]
    );

    const handleNextMove = () => {
      const pushMove =
        formattedPgn?.[currentMove.moveCount]?.[currentMove.boardOrientation];
      if(pushMove){
        const { gameCopy } = makeAMove(
          pushMove,
          game
        );
        setGame(gameCopy);
      }
      if(currentMove.boardOrientation === WHITE){
        const nextMove = { ...currentMove, boardOrientation: BLACK };
        setCurrentMove(nextMove);
      }
      else if (currentMove.boardOrientation === BLACK) {
        const nextMove = { moveCount: currentMove.moveCount + 1, boardOrientation: WHITE };
        setCurrentMove(nextMove);
      }
    };

    console.log("formattedPgn", formattedPgn);
    return (
      <div className="p-5 pt-10 md:grid md:grid-cols-6">
        <div className="md:col-span-4 md:px-5">
          <ChessBoardComp
            boardOrientation={boardOrientation}
            animation={anim}
            game={game}
            mutateGame={(newGame) => setGame(newGame)}
          />
          <div>
            <button>Previous</button>
            <button onClick={handleNextMove}>Next</button>
          </div>
        </div>
      </div>
    );
}

export default Analysis;
