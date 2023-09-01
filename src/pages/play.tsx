import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ReactNode, useRef, useState } from "react";

import Board from "../components/Board";
import Position from "../game/Position";
import Solver from "../game/Solver";

const Play: NextPage = () => {
  const searchParams = useSearchParams();
  const isPvp = searchParams.get("pvp") == "1";

  const solverRef = useRef<Solver | null>(null);
  const [position, setPosition] = useState<Position>(new Position());
  const shouldAIPlay =
    !isPvp && !position.isGameOver() && position.nbMoves() % 2n == 0n;

  const getSolver = (): Solver => {
    if (solverRef.current !== null) {
      return solverRef.current;
    }
    const solver = new Solver();
    solverRef.current = solver;
    return solver;
  };

  const resetGame = () => {
    setPosition(new Position());
  };

  const playColAI = () => {
    if (position.isGameOver()) {
      return;
    }
    const analyzedMoves = getSolver().analyze(position);
    let bestCol = 3n; // columnOrder[0]
    for (const col of getSolver().columnOrder) {
      if (analyzedMoves[Number(col)] > analyzedMoves[Number(bestCol)]) {
        bestCol = col;
      }
    }

    position.playCol(bestCol);
    setPosition(Position.clone(position));
  };

  const playCol = (col: bigint) => {
    if (position.isGameOver() || !position.canPlay(col)) {
      return;
    }

    position.playCol(col);
    setPosition(Position.clone(position));

    if (shouldAIPlay) {
      playColAI();
    }
  };

  const displayGameOver = (): ReactNode => {
    if (!position.winningPieces()) {
      return (
        <div className="text-3xl font-extrabold leading-normal text-gray-700 md:text-[2rem]">
          It was a tie!
        </div>
      );
    }
    return (
      <div className="text-3xl font-extrabold leading-normal text-gray-700 md:text-[2rem]">
        Player {Number(position.nbMoves() + 1n) % 2 ? "🔴" : "🟡"} has won!
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Connect 4 - Play</title>
        <meta name="description" content="Connect 4" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="md:text-[3 rem] text-2xl font-extrabold leading-normal text-gray-700">
          Player vs {isPvp ? "Player" : "Bot"}
        </h1>
        <div className="mb-4 flex space-x-4">
          <Link href="/">
            <button className="rounded-md bg-red-400 px-4 py-2 hover:bg-red-300">
              Back to menu
            </button>
          </Link>
          <button
            className="rounded-md bg-purple-400 px-4 py-2 hover:bg-purple-300"
            onClick={resetGame}
          >
            Restart
          </button>
        </div>
        {position.isGameOver() ? displayGameOver() : null}
        <Board position={position} makeMove={playCol} />
      </main>
    </>
  );
};

export default Play;
