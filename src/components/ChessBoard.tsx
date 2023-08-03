import type { Square, PieceType, ChessInstance } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { makeAMove } from "~/utils/utilFunctions";

interface PropTypes {
  validateMove?: (san: string) => boolean;
  boardOrientation: BoardOrientation;
  animation?: number;
  game: ChessInstance;
  mutateGame: (game: ChessInstance) => void;
}

const ChessBoardComp = ({ validateMove = () => true, boardOrientation, animation = 0, game, mutateGame }: PropTypes) => {
  // const [game, setGame] = useState(new Chess(fen));

  // useEffect(() => {
  //   if (pushMove) {
  //     const { gameCopy } = makeAMove(pushMove, game);
  //     // setGame(gameCopy);
  //     mutateGame(gameCopy);
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [pushMove]);

  // useEffect(() => {
  //   if (fen) {
  //     game.load(fen);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [fen]);

  // const makeAMove = (nextMove: SingleMove): MoveResult => {
  //   const gameCopy = { ...game };
  //   const move = gameCopy.move(nextMove);
  //   return { move, gameCopy };
  // };

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
    }, game);

    if (move === null) return false;

    const isMoveValid = validateMove(move.san);
    if(!isMoveValid) {
      gameCopy.undo();
      return false;
    }

    // setGame(gameCopy);
    mutateGame(gameCopy)
    return true;
  };

  return (
    <div className="w-full md:max-w-4xl">
      <Chessboard
        onPieceDrop={onDrop}
        position={game.fen()}
        boardOrientation={boardOrientation}
        animationDuration={animation}
      />
    </div>
  );
}

export default ChessBoardComp;
