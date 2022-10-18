import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import Board from "../components/board";
import Position from "../game/Position";

const Play: NextPage = () => {
  const [position, setPosition] = useState<Position>(new Position());

  const playCol = (col: bigint) => {
    console.log("Position before playing col " + col + ":", position);
    if (position.canPlay(col)) {
      if (position.isWinningMove(col)) {
        console.log(
          "%c" + "GG u win",
          "color:" + "#00ff00" + ";font-weight:bold;"
        );
      } else {
        console.warn("Not a winner");
      }
      position.playCol(col);
      console.log("Played col", col);
      console.log("Position now", position);
    } else {
      console.error("Tried to play invalid col");
    }
  };

  return (
    <>
      <Head>
        <title>Connect 4 - Play</title>
        <meta name="description" content="Connect 4" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div>Play!</div>
        <Link href="/">
          <button>Back to main menu</button>
        </Link>
        <Board position={position} playCol={playCol} />
      </main>
    </>
  );
};

export default Play;
