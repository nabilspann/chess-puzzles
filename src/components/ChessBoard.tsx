import { Chess } from "chess.js";
import type { Square, PieceType, ShortMove, Move, ChessInstance } from "chess.js";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { SingleMove } from "~/interfaces";

interface MoveResult {
  move: Move | null,
  gameCopy: ChessInstance
}

interface PropTypes {
  pushMove?: SingleMove | null,
  validateMove?: (san: string) => boolean,
  fen?: string,
  boardOrientation: "white" | "black"
}

const ChessBoardComp = ({ pushMove, validateMove = () => true, fen, boardOrientation }: PropTypes) => {
  const [game, setGame] = useState(new Chess(fen));

  useEffect(() => {
    if (pushMove) {
      const { gameCopy } = makeAMove(pushMove);
      setGame(gameCopy);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pushMove]);

  useEffect(() => {
    if (fen) {
      game.load(fen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen]);

  const makeAMove = (nextMove: SingleMove): MoveResult => {
    const gameCopy = { ...game };
    const move = gameCopy.move(nextMove);
    return { move, gameCopy };
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

    const { move, gameCopy } = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: (selectedPiece.toLowerCase() ?? "q") as Exclude<
        PieceType,
        "p" | "k"
      >,
    });

    if (move === null) return false;

    const isMoveValid = validateMove(move.san);
    if(!isMoveValid) {
      gameCopy.undo();
      return false;
    }

    setGame(gameCopy);
    return true;
  };

  return (
    <div className="h-full w-full pb-4 pt-10 md:max-w-4xl">
      <Chessboard onPieceDrop={onDrop} position={game.fen()} boardOrientation={boardOrientation} />
    </div>
  );
}

export default ChessBoardComp;
