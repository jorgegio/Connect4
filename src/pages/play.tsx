import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { ReactNode, useState } from "react";
import Board from "../components/Board";
import Position from "../game/Position";
import Solver from "../game/Solver";

const Play: NextPage = () => {
  const [position, setPosition] = useState<Position>(new Position());
  const [solver, setSolver] = useState<Solver>(new Solver());

  const resetGame = () => {
    setPosition(new Position());
  };

  const playColAI = () => {
    const analyzedMoves = solver.analyze(position);
    const col = BigInt(
      analyzedMoves.reduce((iMax, x, i, arr) => (x >= arr[iMax] ? i : iMax), 0)
    );

    if (position.isGameOver() || !position.canPlay(col)) {
      return;
    }

    position.playCol(col);
    setPosition(Position.clone(position));
  };

  const playCol = (col: bigint) => {
    if (position.isGameOver() || !position.canPlay(col)) {
      return;
    }

    position.playCol(col);
    setPosition(Position.clone(position));

    const analyzedMoves = solver.analyze(position);
    const bestMove = analyzedMoves.reduce(
      (iMax, x, i, arr) => (x >= arr[iMax] ? i : iMax),
      0
    );

    playColAI();
  };

  // const playCol = (col: bigint, isAI = false) => {
  //   const winningPieces = position.winningPieces();

  //   if(winningPieces) {
  //     setIsGameOver(true);
  //     return;
  //   }

  // }

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
        <div className="mb-4 flex space-x-4">
          <Link href="/">
            <button className="rounded-md bg-red-400 py-2 px-4 hover:bg-red-300">
              Back to menu
            </button>
          </Link>
          <button
            className="rounded-md bg-purple-400 py-2 px-4 hover:bg-purple-300"
            onClick={resetGame}
          >
            Restart
          </button>
        </div>
        {position.isGameOver() ? displayGameOver() : null}
        <Board position={position} solver={solver} makeMove={playCol} />
      </main>
    </>
  );
};

export default Play;
