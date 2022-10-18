import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

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
        <Link href="/play">
          <button>Player vs Player</button>
        </Link>
        <Link href="/play">
          <button>Player vs Bot</button>
        </Link>
      </main>
    </>
  );
};

export default Home;
