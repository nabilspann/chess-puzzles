import Head from "next/head";
import { api } from "~/utils/api";
import { useState } from "react";
import type { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import StartPuzzle from "./StartPuzzle";
import { WHITE } from "~/utils/constants";
import type { Difficulty } from "~/interfaces";
import { getOrientation } from "~/utils/utilFunctions";
import Analysis from "./Analysis";

interface Settings {
  difficulty: Difficulty,
  displayPage: string;
  boardOrientation: BoardOrientation
}

export default function Home() {
  const [anim, setAnim] = useState(0);
  const [settings, setSettings] = useState<Settings>({difficulty: "easy", displayPage: "StartPuzzle", boardOrientation: WHITE});
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const { data, isLoading, remove } = api.puzzles.getOne.useQuery(
    { difficulty: settings.difficulty },
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (typeof data?.[0]?.fen === "string") {
          const boardOrientation = getOrientation(data[0]);
          setSettings(prevSettings => ({...prevSettings, boardOrientation }));
          if (anim === 0) setAnim(300);
        }
      },
    }
  );

  const ctx = api.useContext();

  const nextPuzzle = () => {
    void ctx.puzzles.getOne.cancel();
    remove();
    setSettings(prevSettings => ({
      ...prevSettings,
      difficulty,
      displayPage: "StartPuzzle",
    }));
  };

  const changeDifficulty = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(event.target.value as Difficulty);
  };

  if (isLoading) return <div>Loading</div>;

  if (!data || !data[0]) return <div>Something went wrong</div>;

  return (
    <>
      <Head>
        <title>
          Chess Puzzle{settings.displayPage === "Analysis" ? ": Analysis" : ""}
        </title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full p-5 pt-10 md:max-w-5xl">
          <div className="pb-5 text-3xl font-semibold text-center">
            {settings.displayPage === "StartPuzzle"
              ? "Current Puzzle"
              : "Analysis"}
          </div>
          {settings.displayPage === "StartPuzzle" && (
            <StartPuzzle
              data={data}
              isLoading={isLoading}
              boardOrientation={settings.boardOrientation}
              anim={anim}
              nextPage={() =>
                setSettings((prevSettings) => ({
                  ...prevSettings,
                  displayPage: "Analysis",
                }))
              }
            />
          )}
          {settings.displayPage === "Analysis" && (
            <Analysis
              data={data}
              anim={anim}
              boardOrientation={settings.boardOrientation}
              nextPage={nextPuzzle}
              optionValue={difficulty}
              handleChange={changeDifficulty}
            />
          )}
        </div>
      </main>
    </>
  );
}
