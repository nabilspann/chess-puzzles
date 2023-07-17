import { Chess } from "chess.js";
import type { Square, PieceType, ShortMove, Move } from "chess.js";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";

type SingleMove = ShortMove | string;
type MoveResult = Move | null;
interface PropType {
  pushMove?: SingleMove
}

export const ChessBoardComp = ({ pushMove }: PropType) => {
    const [game, setGame] = useState(new Chess());

    useEffect(() => {
      if(pushMove) {
        makeAMove(pushMove);
      }
    }, [pushMove]);

    const makeAMove = (nextMove: SingleMove): MoveResult => {
      const gameCopy = { ...game };
      const result = gameCopy.move(nextMove);
      setGame(gameCopy);
      return result;
    };
  
    const onDrop = (
      sourceSquare: Square,
      targetSquare: Square,
      piece: string
    ) => {
      // const gameCopy = { ...game };
      const selectedPiece = piece[1];

      if (!selectedPiece) {
        return false;
      }

      const move = makeAMove({
        from: sourceSquare,
        to: targetSquare,
        promotion: (selectedPiece.toLowerCase() ?? "q") as Exclude<
          PieceType,
          "p" | "k"
        >,
      });

      // const move = gameCopy.move({
      //   from: sourceSquare,
      //   to: targetSquare,
      //   promotion:(selectedPiece.toLowerCase() ?? 'q') as Exclude<PieceType, 'p' | 'k'>,
      // });

      if (move === null) return false;
      return true;
    };

    return (
      <div className="h-full w-full border-x p-4 md:max-w-4xl">
        <Chessboard onPieceDrop={onDrop} position={game.fen()} />
      </div>
    );
}