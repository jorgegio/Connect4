import type { NextPage } from "next";
import Head from "next/head";
import Board from "../components/board";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Connect 4</title>
        <meta name="description" content="Connect 4" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
          Connect 4
        </h1>
        <p className="text-2xl text-gray-700">Developed by Jorge Giovannetti</p>
        <Board />
      </main>
    </>
  );
};

export default Home;