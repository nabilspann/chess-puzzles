import { useEffect, useMemo, useReducer, useState } from "react";
import ChessBoardComp from "~/components/ChessBoard"
import { type RouterOutputs, api } from "~/utils/api";
import SelectOption from "~/components/SelectOption";
import type { SingleMove, BoardOrientation } from "~/interfaces";
import { WHITE, BLACK } from "~/utils/contants";

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

const formatPgn = (pgn: string) => {
    const arrayPgn = pgn
      .split(/\d+\. /g)
      .slice(1)
      .map((eachMove) => eachMove.trim().split(' '));

    const formattedPgn = arrayPgn.map((eachMove) => ({
      white: eachMove[0] && eachMove[0] !== "..." ? eachMove[0] : null,
      black: eachMove[1] || null,
    }));

    return formattedPgn;
};

const getOrientation = (puzzleData: PuzzleData) => {
  return puzzleData.fen.includes('w') ? WHITE : BLACK;
};

const StartPuzzle = () => {
  const [ option, setOption ] = useState("easy");
  const [ difficulty, setDifficulty ] = useState({ value: "easy" });
  //Current move number
  const [ moveCount, setMoveCount ] = useState(0);
  //To push moves to the chess board
  const [ pushMove, setPushMove ] = useState<SingleMove | null>(null);
  const [ anim, setAnim ] = useState(0);

  const messageReducer = (_: unknown, action: MessageReducer): MessageResponse => {
    switch(action.type){
      case PUZZLE_INITIALIZATION:
        return {
          messageType: PUZZLE_INITIALIZATION,
          message: `Find the best move for ${
            action.boardOrientation || WHITE
          }!`,
        };
      case INCORRECT_MOVE:
        return {
          messageType: INCORRECT_MOVE,
          message: "Incorrect move. Please try again!"
        }
      case CORRECT_MOVE:
        return {
          messageType: CORRECT_MOVE,
          message: "Best Move! Keep moving..." 
        }
      case PUZZLE_SOLVED:
        return {
          messageType: PUZZLE_SOLVED,
          message: "Success! Click on the next puzzle."
        }
      default:
        return {
          messageType: "",
          message: ""
        }
    }
  }

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
    // setDifficulty(option);
  };

  if (isLoading) return <div>Loading</div>;

  if (!data || !data[0]) return <div>Something went wrong</div>;
  
  const boardOrientation = getOrientation(data[0]);
  console.log("formattedPgn", formattedPgn)
  console.log("data", data);

  const puzzleLogic = (chessMove: string) => {
    const currentMove = formattedPgn[moveCount];

    console.log("currentMove", currentMove);
    console.log("chessMove", chessMove);
    console.log(
      "currentMove logic",
      currentMove && currentMove[boardOrientation] === chessMove
    );
    
    //Check if the user made the correct move
    if (currentMove  && !!(currentMove[boardOrientation] === chessMove)) {
      //This checks if the puzzle reached the end
      if (moveCount >= pgnLength - 1) {
        console.log("YOU HAVE REACHED THE END!!!!");
        setPuzzleMessage({ type: PUZZLE_SOLVED });
        return true;
      }
      const nextMove = formattedPgn[moveCount + 1];
      //Next move
      setMoveCount(moveCount + 1);
      setPuzzleMessage({ type: CORRECT_MOVE });
      //Move response from the puzzle
      if(boardOrientation === WHITE){
        setPushMove(currentMove[BLACK]);
      } 
      else if (nextMove && boardOrientation === BLACK) {
        setPushMove(nextMove[WHITE]);
      }
      return true;
    }
    setPuzzleMessage({ type: INCORRECT_MOVE });
    return false;
  }

  const { message, messageType } = puzzleMessage;
  return (
    <div className="py-5">
      <div
        className={`text-center font-semibold 
          ${messageType === INCORRECT_MOVE ? "text-red-500" : ""}
          ${messageType === PUZZLE_SOLVED ? "text-lime-500" : ""}
        `}
      >
        {message}
      </div>
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
    </div>
  );
}

export default StartPuzzle;
