import { useEffect, useState } from "react";
import ChessBoardComp from "~/components/ChessBoard"
import { api } from "~/utils/api";
import SelectOption from "~/components/SelectOption";

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

const StartPuzzle = () => {
  // let option = "easy";
  const [ option, setOption ] = useState("easy");
  const [ difficulty, setDifficulty ] = useState({ value: "easy" });
  // const [difficulty, setDifficulty] = useState("easy");

  // api.puzzles.getOne.useQuery({ difficulty });
  const ctx = api.useContext();
  // const { data, isLoading, refetch } = api.puzzles.getOne.useQuery({ difficulty: difficulty.value }, { refetchOnWindowFocus: false });
  const { data, isLoading, refetch } = api.puzzles.getOne.useQuery(
    // { difficulty },
    { difficulty: difficulty.value },
    {
      refetchOnWindowFocus: false,
      // cacheTime: 0,
      // staleTime: 0,
      // refetchOnMount: false,
      // retryOnMount: false,
      // enabled: fetchEnabled
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
    // setDifficulty(option);
  };

  if (isLoading) return <div>Loading</div>;

  if (!data || !data[0]) return <div>Something went wrong</div>;
  console.log("data", data);
  // console.log("Startpuzzle")
  return (
    <div>
      {/* <Board difficulty={difficulty} /> */}
      <ChessBoardComp fen={data[0].fen} />
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
