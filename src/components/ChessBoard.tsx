import { Chess } from "chess.js";
import type { Square, PieceType, ShortMove, Move } from "chess.js";
import { memo, useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";

type SingleMove = ShortMove | string;
type MoveResult = Move | null;
interface PropTypes {
  pushMove?: SingleMove,
  validateMove?: (san: string) => boolean,
  fen?: string,
}

const ChessBoardComp = ({ pushMove, validateMove = () => true, fen }: PropTypes) => {
    const [game, setGame] = useState(new Chess(fen));

    useEffect(() => {
      if (pushMove) {
        makeAMove(pushMove);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pushMove]);

    useEffect(() => {
      game.load(fen);
    }, [fen]);

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

      if (move === null) return false;
      return validateMove(move.san);
    };

    return (
      <div className="h-full w-full pb-4 pt-10 md:max-w-4xl">
        <Chessboard onPieceDrop={onDrop} position={game.fen()} />
      </div>
    );
}

export default memo(ChessBoardComp);
