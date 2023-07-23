import { useEffect, useState } from "react";
import ChessBoardComp from "~/components/ChessBoard"
import { api } from "~/utils/api";
import SelectOption from "~/components/SelectOption";
import type { SingleMove } from "~/interfaces";

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

const WHITE = "white";
const BLACK = "black";

const formatPgn = (pgn: string) => {
    const arrayPgn = pgn
      .replace("...", ". ...")
      .split(/\d+\. /g)
      .slice(1)
      .map((eachMove) => eachMove.trim().split(' '));
    const formattedPgn = arrayPgn.map((eachMove) => ({white: eachMove[0] || null, black: eachMove[1] || null}))
    return formattedPgn;
};

const StartPuzzle = () => {
  // let option = "easy";
  const [ option, setOption ] = useState("easy");
  const [ difficulty, setDifficulty ] = useState({ value: "easy" });
  //Current move number
  const [ moveCount, setMoveCount ] = useState(0);
  //To push moves to the chess board
  const [ pushMove, setPushMove ] = useState<SingleMove | null>(null);
  // const [difficulty, setDifficulty] = useState("easy");

  // api.puzzles.getOne.useQuery({ difficulty });
  const ctx = api.useContext();
  // const { data, isLoading, refetch } = api.puzzles.getOne.useQuery({ difficulty: difficulty.value }, { refetchOnWindowFocus: false });
  const { data, isLoading, refetch } = api.puzzles.getOne.useQuery(
    // { difficulty },
    { difficulty: difficulty.value },
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // option = event.target.value;
    setOption(event.target.value);
    // setDifficulty({ ...difficulty, value: event.target.value });

    // setDifficulty(event.target.value);

    // void ctx.puzzles.getOne.invalidate();
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
  
  const boardOrientation =
    data[0].fen?.split(" ")[1] === "b" ? BLACK : WHITE;
  const formattedPgn = formatPgn(data[0]?.pgn);
  const pgnLength = formattedPgn.length;
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
        return true;
      }
      const nextMove = formattedPgn[moveCount + 1];
      //Next move
      setMoveCount(moveCount + 1);

      //Move response from the puzzle
      if(boardOrientation === WHITE){
        setPushMove(currentMove[BLACK]);
      } 
      else if (nextMove && boardOrientation === BLACK) {
        setPushMove(nextMove[WHITE]);
      }
      return true;
    }
    return false;
  }

  return (
    <div>
      {/* <Board difficulty={difficulty} /> */}
      <ChessBoardComp
        fen={data[0].fen}
        validateMove={puzzleLogic}
        boardOrientation={boardOrientation}
        pushMove={pushMove}
      />
      <div>
        <SelectOption
          labelText="Select the difficulty"
          selectValue={option}
          // selectValue={difficulty.value}
          // selectValue={difficulty}
          handleChange={handleChange}
          options={difficultyOptions}
        />
        <button onClick={() => void nextPuzzle()}>Next puzzle</button>
      </div>
    </div>
  );
}

export default StartPuzzle;
