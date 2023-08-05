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
    const [currentMove, setCurrentMove] = useState({ moveCount: 0, turn: boardOrientation, currentFen: game.fen() });

    useEffect(() => {
      const fen = data?.[0]?.fen;
      if (fen) {
        game.load(fen);
        setCurrentMove(state => ({ ...state, currentFen: fen}));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);
    
    useEffect(() => {
      setCurrentMove(state => ({ ...state, turn: boardOrientation }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boardOrientation])

    const puzzleData = data?.[0];
    const formattedPgn = useMemo(
      () => formatPgn(puzzleData?.pgn || ""),
      [puzzleData?.pgn]
    );
    const pgnLength = formattedPgn.length;

    const handleNextMove = () => {
      const pushMove =
        formattedPgn?.[currentMove.moveCount]?.[currentMove.turn];
      console.log("currentFEn", currentMove);
      console.log("game.fen()", game.fen());

      console.log("fen equality?", game.fen() === currentMove.currentFen)
      if(pushMove && currentMove.moveCount < pgnLength) {
        const { gameCopy } = makeAMove(
          pushMove,
          game
        );

        setGame(gameCopy);
        if (currentMove.turn === WHITE) {
          const nextMove = { ...currentMove, turn: BLACK };
          setCurrentMove(nextMove);
        } else if (
          currentMove.turn === BLACK &&
          currentMove.moveCount < pgnLength - 1
        ) {
          const nextMove = {
            moveCount: currentMove.moveCount + 1,
            turn: WHITE,
          };
          setCurrentMove(nextMove);
        }
      }
    };

    const handlePreviousMove = () => {
      const gameCopy = { ...game };

      const previousMove = gameCopy.undo();
      if (currentMove.turn === WHITE && previousMove) {
        const nextMove = {
          moveCount: currentMove.moveCount - 1,
          turn: BLACK,
        };
        setCurrentMove(nextMove);
      } else if (
        currentMove.turn === BLACK &&
        !!previousMove &&
        currentMove.moveCount > 0
      ) {
        const nextMove = {
          moveCount: currentMove.moveCount,
          turn: WHITE,
        };
        setCurrentMove(nextMove);
      }
      setGame(gameCopy);
    }

    console.log("currentMove", currentMove)
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
            <button onClick={handlePreviousMove}>Previous</button>
            <button onClick={handleNextMove}>Next</button>
          </div>
        </div>
      </div>
    );
}

export default Analysis;
