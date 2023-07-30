import { useEffect, useMemo, useReducer, useState } from "react";
import ChessBoardComp from "~/components/ChessBoard"
import { type RouterOutputs, api } from "~/utils/api";
import SelectOption from "~/components/SelectOption";
import type { SingleMove, BoardOrientation } from "~/interfaces";
import { WHITE, BLACK } from "~/utils/contants";
import Annotation from "~/components/Annotation";

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

// type BoardOrientation = ReturnType<typeof getOrientation>;
// const WHITE = "white";
// const BLACK = "black";

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
  type: string,
  boardOrientation?: BoardOrientation
}

interface MessageResponse {
  messageType: typeof messageTypes[number],
  message: string
}

interface PgnMove {
  white: string | null;
  black: string | null;
}

interface AnnotationAction {
  type: BoardOrientation,
  whiteMove?: string | null,
  blackMove?: string | null
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

const getOrientation = (puzzleData: PuzzleData) => {
  return puzzleData.fen.includes('w') ? WHITE : BLACK;
};

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
        ...newState[newState.length - 1],
        black
      };
      return [ ...newState, {white, black: null}];
    }
    default:
      return []
  }
}

const StartPuzzle = () => {
  const [ option, setOption ] = useState("easy");
  const [ difficulty, setDifficulty ] = useState({ value: "easy" });
  //Current move number
  const [ moveCount, setMoveCount ] = useState(0);
  //To push moves to the chess board to respond to the user's move
  const [ pushMove, setPushMove ] = useState<SingleMove | null>(null);
  // const [annotation, setAnnotation] =
  //   useState<PgnMove[]>([]);
  const [annotation, setAnnotation] = useReducer(annotationReducer, []);

  const [ anim, setAnim ] = useState(0);

  const [puzzleMessage, setPuzzleMessage] = useReducer(messageReducer, {
    messageType: "",
    message: "",
  });

  const ctx = api.useContext();
  const { data, isLoading, refetch } = api.puzzles.getOne.useQuery(
    { difficulty: difficulty.value },
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        console.log("hit");
        if (typeof data?.[0]?.fen === "string") {
          const boardOrientation = getOrientation(data[0]);
          setPuzzleMessage({ type: PUZZLE_INITIALIZATION, boardOrientation })
          if (anim === 0) setAnim(300);
        }
      },
    }
  );

  const puzzleData = data?.[0];
  const formattedPgn = useMemo(() => formatPgn(puzzleData?.pgn || ''), [puzzleData?.pgn]);
  const pgnLength = formattedPgn.length;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOption(event.target.value);
    void ctx.puzzles.getOne.cancel();
  };

  const nextPuzzle = async (): Promise<void> => {
    await refetch();
    // console.log("nextpuzzle called??");
    setDifficulty({ ...difficulty, value: option });
    setMoveCount(0);
    setAnnotation([]);
    // setDifficulty(option);
  };

  if (isLoading) return <div>Loading</div>;

  if (!data || !data[0]) return <div>Something went wrong</div>;
  
  const boardOrientation = getOrientation(data[0]);
  console.log("formattedPgn", formattedPgn)
  console.log("data", data);
  // console.log("pushmove", pushMove);

  const puzzleLogic = (chessMove: string) => {
    const currentMove = formattedPgn[moveCount];

    // console.log("currentMove", currentMove);
    console.log("chessMove", chessMove);
    // console.log(
    //   "currentMove logic",
    //   currentMove && currentMove[boardOrientation] === chessMove
    // );

    if(puzzleMessage.messageType === PUZZLE_SOLVED){
      return false;
    }
    
    //Check if the user made the correct move
    if (currentMove  && !!(currentMove[boardOrientation] === chessMove)) {
      // setAnnotationPushMove({move: chessMove, boardOrientation});
      // setAnnotationPushMove(previousMove => ({ ...previousMove, move: chessMove, boardOrientation }));
      // setAnnotationPushMove(chessMove);
      //This checks if the puzzle reached the end
      if (moveCount >= pgnLength - 1) {
        setPuzzleMessage({ type: PUZZLE_SOLVED });
        if(boardOrientation === WHITE){
          // setAnnotation(previousMoves => [
          //   ...previousMoves,
          //   { white: chessMove, black: null}
          // ])
          setAnnotation({
            type: WHITE,
            whiteMove: chessMove,
          });
        } else {
          // setAnnotation((previousMoves) => {
          //   const previousArr = [...previousMoves];
          //   console.log("previousArr", previousArr);
          //   previousArr[previousMoves.length - 1] = {
          //     ...previousArr[previousMoves.length - 1],
          //     black: chessMove,
          //   };
          //   return [...previousArr];
          // });
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
        setPushMove(currentMove[BLACK]);
        // setAnnotation((previousMoves) => [
        //   ...previousMoves,
        //   { white: chessMove, black: currentMove[BLACK] },
        // ]);
        setAnnotation({
          type: WHITE,
          whiteMove: chessMove,
          blackMove: currentMove[BLACK],
        });
        // setAnnotationPushMove(currentMove[BLACK]);
      } else if (nextMove && boardOrientation === BLACK && nextMove[WHITE]) {
        setPushMove(nextMove[WHITE]);
        
        // setAnnotation((previousMoves) => {
        //   if(previousMoves.length === 0){
        //     console.log("length 0")
        //     return [
        //       { white: null, black: chessMove },
        //       { white: nextMove[WHITE], black: null },
        //     ];
        //   }
        //   const previousArr = [...previousMoves];
        //   console.log("previousArr", previousArr);
        //   previousArr[previousMoves.length - 1] = {
        //     ...previousArr[previousMoves.length - 1],
        //     black: chessMove
        //   };
        //   return [...previousArr, { white: nextMove[WHITE], black: null }];
        // });
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
    <div className="py-5">
      <ChessBoardComp
        fen={data[0].fen}
        validateMove={puzzleLogic}
        boardOrientation={boardOrientation}
        pushMove={pushMove}
        animation={anim}
      />
      <div>
        <SelectOption
          labelText="Select the difficulty"
          selectValue={option}
          handleChange={handleChange}
          options={difficultyOptions}
        />
        <button onClick={() => void nextPuzzle()}>Next puzzle</button>
      </div>
      <div
        className={`pt-5 text-center text-2xl font-semibold
          ${messageType === INCORRECT_MOVE ? "text-red-500" : ""}
          ${messageType === PUZZLE_SOLVED ? "text-lime-500" : ""}
        `}
      >
        {message}
      </div>
      <div className="h-full">
        <Annotation pgn={annotation} />
      </div>
    </div>
  );
}

export default StartPuzzle;
