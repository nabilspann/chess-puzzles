import { useEffect, useMemo, useReducer, useState } from "react";
import ChessBoardComp from "~/components/ChessBoard"
import { type RouterOutputs, api } from "~/utils/api";
import SelectOption from "~/components/SelectOption";
import type { Difficulty } from "~/interfaces";
import { WHITE, BLACK } from "~/utils/constants";
import Annotation from "~/components/Annotation";
import { Chess } from "chess.js";
import { makeAMove } from "~/utils/utilFunctions";
import type { BoardOrientation } from "react-chessboard/dist/chessboard/types";

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

type PuzzleData = RouterOutputs["puzzles"]["getOne"][number];

const messageTypes = [
  "PUZZLE_INITIALIZATION",
  "INCORRECT_MOVE",
  "CORRECT_MOVE",
  "PUZZLE_SOLVED",
  ""
] as const;

const [PUZZLE_INITIALIZATION, INCORRECT_MOVE, CORRECT_MOVE, PUZZLE_SOLVED] =
  messageTypes;

interface MessageReducer {
  type: string;
  boardOrientation?: BoardOrientation;
}

interface MessageResponse {
  messageType: typeof messageTypes[number];
  message: string;
}

interface PgnMove {
  white: string | null;
  black: string | null;
}

interface AnnotationAction {
  type: BoardOrientation | "reset_board";
  whiteMove?: string | null;
  blackMove?: string | null;
}

interface PropType {
  data: PuzzleData[];
  isLoading: boolean;
  refetch: () => Promise<void>;
  boardOrientation: BoardOrientation;
  anim: number;
  difficulty: Difficulty;
  setDifficulty: (x: Difficulty) => void;
}

const formatPgn = (pgn: string) => {
    const arrayPgn = pgn
      .split(/\d+\. /g)
      .slice(1)
      .map((eachMove) => eachMove.trim().split(' '));
    const newArrPgn = pgn.split(/\d+\. /g);
    console.log("newArrPgn", newArrPgn)
    const formattedPgn = arrayPgn.map((eachMove) => ({
      white: eachMove[0] && eachMove[0] !== "..." ? eachMove[0] : null,
      black: eachMove[1] || null,
    }));

    return formattedPgn;
};

// const getOrientation = (puzzleData: PuzzleData) => {
//   return puzzleData.fen.includes('w') ? WHITE : BLACK;
// };

const messageReducer = (
  _: unknown,
  action: MessageReducer
): MessageResponse => {
  switch (action.type) {
    case PUZZLE_INITIALIZATION:
      return {
        messageType: PUZZLE_INITIALIZATION,
        message: `Find the best move for ${action.boardOrientation || WHITE}!`,
      };
    case INCORRECT_MOVE:
      return {
        messageType: INCORRECT_MOVE,
        message: "Incorrect move. Please try again!",
      };
    case CORRECT_MOVE:
      return {
        messageType: CORRECT_MOVE,
        message: "Best Move! Keep moving...",
      };
    case PUZZLE_SOLVED:
      return {
        messageType: PUZZLE_SOLVED,
        message: "Success! Click on the next puzzle.",
      };
    default:
      return {
        messageType: "",
        message: "",
      };
  }
};

const annotationReducer = (state: PgnMove[], action: AnnotationAction): PgnMove[] => {
  const black = action.blackMove || null;
  const white = action.whiteMove || null;
  switch(action.type){
    case WHITE:
      return [
        ...state,
        { white: action.whiteMove || null, black }
      ]
    case BLACK: {
      if(state.length === 0) {
         return [
           { white: null, black },
           { white, black: null },
         ];
      }
      const newState = [ ...state ];
      newState[newState.length - 1] = {
        white: newState[newState.length - 1]?.white || null,
        black,
      };
      if(!!white){
        newState.push({ white, black: null });
      }
      return newState;
    }
    default:
      return []
  }
}

const StartPuzzle = ({
  data,
  refetch,
  boardOrientation,
  anim,
  difficulty,
  setDifficulty
}: PropType) => {
  const [game, setGame] = useState(new Chess());
  const [ option, setOption ] = useState(difficulty);
  //Current move number
  const [ moveCount, setMoveCount ] = useState(0);
  const [annotation, setAnnotation] = useReducer(annotationReducer, []);
  const [puzzleMessage, setPuzzleMessage] = useReducer(messageReducer, {
    messageType: "",
    message: "",
  });

  useEffect(() => {
    const fen = data?.[0]?.fen;
    setPuzzleMessage({ type: PUZZLE_INITIALIZATION, boardOrientation });
    if (fen) {
      game.load(fen);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardOrientation, data]);

  const ctx = api.useContext();

  const puzzleData = data?.[0];
  const formattedPgn = useMemo(() => formatPgn(puzzleData?.pgn || ''), [puzzleData?.pgn]);
  const pgnLength = formattedPgn.length;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOption(event.target.value as Difficulty);
    void ctx.puzzles.getOne.cancel();
  };

  const nextPuzzle = async (): Promise<void> => {
    await refetch();
    setDifficulty(option);

    setMoveCount(0);
    setAnnotation({ type: "reset_board" });
  };

  const puzzleLogic = (chessMove: string) => {
    const currentMove = formattedPgn[moveCount];

    if(puzzleMessage.messageType === PUZZLE_SOLVED){
      return false;
    }
    
    //Check if the user made the correct move
    if (currentMove  && !!(currentMove[boardOrientation] === chessMove)) {
      //This checks if the puzzle reached the end
      if (moveCount >= pgnLength - 1) {
        setPuzzleMessage({ type: PUZZLE_SOLVED });
        if(boardOrientation === WHITE){
          setAnnotation({
            type: WHITE,
            whiteMove: chessMove,
          });
        } else {
          setAnnotation({
            type: BLACK,
            blackMove: chessMove,
          });
        }
        return true;
      }
      const nextMove = formattedPgn[moveCount + 1];
      //Next move
      setMoveCount(moveCount + 1);
      setPuzzleMessage({ type: CORRECT_MOVE });
      //Move response from the puzzle
      if (boardOrientation === WHITE && currentMove[BLACK]) {
        // setPushMove(currentMove[BLACK]);
        const { gameCopy } = makeAMove(currentMove[BLACK], game);
        setGame(gameCopy);
        setAnnotation({
          type: WHITE,
          whiteMove: chessMove,
          blackMove: currentMove[BLACK],
        });
      } else if (nextMove && boardOrientation === BLACK && nextMove[WHITE]) {
        // setPushMove(nextMove[WHITE]);
        const { gameCopy } = makeAMove(nextMove[WHITE], game);
        setGame(gameCopy);
        setAnnotation({
          type: BLACK,
          whiteMove: nextMove[WHITE],
          blackMove: chessMove,
        });
      }
      return true;
    }
    setPuzzleMessage({ type: INCORRECT_MOVE });
    return false;
  }

  const { message, messageType } = puzzleMessage;
  return (
    <div className="p-5 pt-10 md:grid md:grid-cols-6">
      <div className="md:col-span-4 md:px-5">
        <ChessBoardComp
          validateMove={puzzleLogic}
          boardOrientation={boardOrientation}
          animation={anim}
          game={game}
          mutateGame={(newGame) => setGame(newGame)}
        />
        <div className="py-5">
          <SelectOption
            labelText="Select the difficulty"
            selectValue={option}
            handleChange={handleChange}
            options={difficultyOptions}
          />
          <button onClick={() => void nextPuzzle()}>Next puzzle</button>
        </div>
        <div
          className={`text-center text-2xl font-semibold
          ${messageType === INCORRECT_MOVE ? "text-red-500" : ""}
          ${messageType === PUZZLE_SOLVED ? "text-lime-500" : ""}
        `}
        >
          {message}
        </div>
      </div>
      <div className="h-full max-md:py-10 md:col-span-2">
        <Annotation pgn={annotation} />
      </div>
    </div>
  );
}

export default StartPuzzle;
