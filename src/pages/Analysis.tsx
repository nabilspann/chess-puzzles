import { Chess } from "chess.js";
import { useEffect, useMemo, useState } from "react";
import type { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import Annotation from "~/components/Annotation";
import ChessBoardComp from "~/components/ChessBoard";
import SelectOption from "~/components/SelectOption";
import type { PuzzleData } from "~/interfaces";
import { WHITE, BLACK } from "~/utils/constants";
import { formatPgn, makeAMove } from "~/utils/utilFunctions";

interface PropType {
  data: PuzzleData[];
  boardOrientation: BoardOrientation;
  anim: number;
  nextPage: () => Promise<void>;
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  optionValue: string;
}

const difficultyOptions = [
  {
    value: "easy",
    text: "Easy",
  },
  {
    value: "medium",
    text: "Medium",
  },
  {
    value: "hard",
    text: "Hard",
  },
];

const getFocusMove = (moveNumber: number, turn: BoardOrientation) => {
  if(moveNumber === 0 && turn === WHITE){
    return null;
  } else if(moveNumber >= 0 && turn === BLACK){
    return {moveNumber, turn: WHITE}
  } else if (moveNumber >= 0 && turn === WHITE){
    return { moveNumber: moveNumber - 1, turn: BLACK };
  }
}

const Analysis = ({data, boardOrientation, anim, nextPage, handleChange, optionValue} : PropType) => {
  const [game, setGame] = useState(new Chess());
  const [currentMove, setCurrentMove] = useState({
    moveNumber: 0,
    turn: boardOrientation,
    currentFen: game.fen(),
  });

  const puzzleData = data?.[0];
  const formattedPgn = useMemo(
    () => formatPgn(puzzleData?.pgn || ""),
    [puzzleData?.pgn]
  );
  const pgnLength = formattedPgn.length;

  useEffect(() => {
    const fen = data?.[0]?.fen;
    if (fen) {
      game.load(fen);
      setCurrentMove((state) => ({ ...state, currentFen: fen }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    setCurrentMove((state) => ({ ...state, turn: boardOrientation }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardOrientation]);

  const handleNextMove = () => {
    const pushMove = formattedPgn?.[currentMove.moveNumber]?.[currentMove.turn];
    const gameFen = game.fen();

    if (pushMove && currentMove.moveNumber < pgnLength) {
      const { gameCopy } = makeAMove(pushMove, game);

      setGame(gameCopy);
      if (currentMove.turn === WHITE && gameFen === currentMove.currentFen) {
        setCurrentMove((curMove) => ({
          ...curMove,
          turn: BLACK,
          currentFen: gameCopy.fen(),
        }));
      } else if (
        currentMove.turn === BLACK &&
        currentMove.moveNumber < pgnLength &&
        gameFen === currentMove.currentFen
      ) {
        setCurrentMove((curMove) => ({
          ...curMove,
          moveNumber: currentMove.moveNumber + 1,
          turn: WHITE,
          currentFen: gameCopy.fen(),
        }));
      }
    }
  };

  const handlePreviousMove = () => {
    const gameFen = game.fen();
    const gameCopy = { ...game };

    const previousMove = gameCopy.undo();

    let fenObj = {};
    if (gameFen === currentMove.currentFen && !!previousMove) {
      fenObj = {
        currentFen: gameCopy.fen(),
      };
    }
    if (
      currentMove.turn === WHITE &&
      !!previousMove &&
      gameFen === currentMove.currentFen
    ) {
      setCurrentMove((curMove) => ({
        ...curMove,
        moveNumber: currentMove.moveNumber - 1,
        turn: BLACK,
        ...fenObj,
      }));
    } else if (
      currentMove.turn === BLACK &&
      !!previousMove &&
      gameFen === currentMove.currentFen
    ) {
      const whiteMove = formattedPgn?.[currentMove.moveNumber]?.[WHITE];
      if (currentMove.moveNumber === 0 && !whiteMove) {
        return;
      }
       setCurrentMove((curMove) => ({
         ...curMove,
         moveNumber: currentMove.moveNumber,
         turn: WHITE,
         ...fenObj,
       }));
    }
    setGame(gameCopy);
  };

  //If the user manually moves pieces in the same order as the puzzle solution, update the currentMove object as well
  const checkEachMove = (movePlayed: string) => {
    const correctPuzzleMove =
      formattedPgn?.[currentMove.moveNumber]?.[currentMove.turn];
    if (movePlayed === correctPuzzleMove) {
      if (currentMove.turn === WHITE) {
        setCurrentMove((curMove) => ({
          ...curMove,
          turn: BLACK,
          currentFen: game.fen(),
        }));
      } else if (
        currentMove.turn === BLACK &&
        currentMove.moveNumber < pgnLength
      ) {
        setCurrentMove((curMove) => ({
          ...curMove,
          moveNumber: currentMove.moveNumber + 1,
          turn: WHITE,
          currentFen: game.fen(),
        }));
      }
    }
    return true;
  };

  return (
    <div className="p-5 pt-10 md:grid md:grid-cols-6">
      <div className="md:col-span-4 md:px-5">
        <ChessBoardComp
          boardOrientation={boardOrientation}
          animation={anim}
          game={game}
          mutateGame={(newGame) => setGame(newGame)}
          validateMove={checkEachMove}
        />
        <div>
          <div className="py-5">
            <SelectOption
              labelText="Select the difficulty"
              selectValue={optionValue}
              handleChange={handleChange}
              options={difficultyOptions}
            />
          </div>
          <button onClick={() => void nextPage()}>Next Puzzle</button>
          {/* <button onClick={handlePreviousMove}>Previous</button>
          <button onClick={handleNextMove}>Next</button> */}
        </div>
      </div>
      <div className="h-full max-md:py-10 md:col-span-2">
        <Annotation
          pgn={formattedPgn}
          focusMove={getFocusMove(currentMove.moveNumber, currentMove.turn)}
        />
      </div>
    </div>
  );
}

export default Analysis;
