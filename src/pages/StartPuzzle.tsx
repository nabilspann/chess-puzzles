import { Dispatch, SetStateAction, useEffect, useState, useMemo } from "react";
import { api, RouterOutputs } from "~/utils/api";
import SelectOption from "~/components/SelectOption";
import type { SingleMove } from "~/interfaces";


import { Chess } from "chess.js";
import type { Square, PieceType, ShortMove, Move, ChessInstance } from "chess.js";
import { Chessboard } from "react-chessboard";

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

type PuzzleData = RouterOutputs["puzzles"]["getOne"][number];

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

type FormatPgn = ReturnType<typeof formatPgn>
const formatPgn = (pgn: string) => {
    const arrayPgn = pgn
      .replace("...", ". ...")
      .split(/\d+\. /g)
      .slice(1)
      .map((eachMove) => eachMove.trim().split(' '));
    const formattedPgn = arrayPgn.map((eachMove) => ({white: eachMove[0] || null, black: eachMove[1] || null}))
    return formattedPgn;
};

type BoardOrientation = ReturnType<typeof getOrientation>
let getOrientation = (puzzleData:PuzzleData)=>{
  return puzzleData.fen.includes('w') ? WHITE : BLACK;
}

type reactive<T> = ReturnType< (x: T) => ([typeof x, Dispatch<SetStateAction<T>>]) > 
const puzzleLogic = (
  data: PuzzleData, $moveCount: reactive<number>, $pushMove: reactive<SingleMove | null>
) => {
  let [moveCount, setMoveCount] = $moveCount
  let [_, setPushMove] = $pushMove

  const boardOrientation = getOrientation(data)
  const formattedPgn = formatPgn(data.pgn);

  return ( chessMove: string ) => {
    const currentMove = formattedPgn[moveCount];

    // If user made wrong move (or moveCount out of range)
    if (!currentMove || currentMove[boardOrientation] !== chessMove) return false;
    
    // This checks if the puzzle reached the end
    if (moveCount >= formattedPgn.length - 1) {
      console.log("YOU HAVE REACHED THE END!!!!");
      return true;
    }
    
    // Next move
    setMoveCount(moveCount + 1); 
    const nextMove = formattedPgn[moveCount];

    // Move response from the puzzle
    if(boardOrientation === WHITE){
      setPushMove(currentMove[BLACK]);
    } else
    if (nextMove && boardOrientation === BLACK) {
      setPushMove(nextMove[WHITE]);
    }

    return true
  }
}

const StartPuzzle = () => {
  const [ difficulty, setDifficulty ] = useState("easy")
  const [ settings, setSettings ] = useState({difficulty})

  const [game, setGame] = useState(new Chess())
  const [anim, setAnim] = useState(0)

  let { data, refetch } = api.puzzles.getOne.useQuery(
    { difficulty },
    { refetchOnWindowFocus: false,
      onSuccess: data => {
        console.log('hit')
        if (typeof data?.[0]?.fen === 'string') {
          setGame( new Chess(data?.[0]?.fen) )
          setAnim(300)
        }
      }
    }
  )

  const $moveCount = useState(0)
  const $pushMove = useState<SingleMove | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({...settings, difficulty: event.target.value})
  }

  const nextPuzzle = async (): Promise<void> => {
    setDifficulty(settings.difficulty)
    await refetch()
    $moveCount[1](0)
  }

  return (
    <div>
      <div>
        <h3>Difficulty: {difficulty}</h3>

        <div className="h-full w-full pb-4 pt-10 md:max-w-4xl">
          {game.fen()}
          <Chessboard position={game.fen()} animationDuration={anim} />
        </div>
        
      </div>
      <div>
        <SelectOption
          labelText="Select the difficulty"
          selectValue={settings.difficulty}
          handleChange={handleChange}
          options={difficultyOptions}
        />
        <button onClick={nextPuzzle}>Next puzzle</button>
      </div>
    </div>
  );
}

export default StartPuzzle;