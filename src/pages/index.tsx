import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Connect 4</title>
        <meta name="og:title" content="Connect 4" />
        <meta
          name="og:description"
          content="Play connect 4 against a friend or bot!"
        />
        <meta property="og:image" content="<generated>" />
        <meta property="og:image:type" content="<generated>" />
        <meta property="og:image:width" content="<generated>" />
        <meta property="og:image:height" content="<generated>" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <div className="flex flex-grow flex-col items-center justify-center">
          <Image
            src="/logo.png"
            alt="Connect 4 Logo"
            width="128"
            height="128"
          />
          <h1 className="mt-2 text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
            Connect 4
          </h1>
          <div className="flex flex-col items-stretch">
            <Link className="flex flex-grow" href="/play?pvp=1">
              <button className="flex flex-1 rounded-md bg-pink-400 px-4 py-2 hover:bg-pink-300">
                Player vs Player
              </button>
            </Link>
            <Link className="flex flex-grow" href="/play">
              <button className="mt-4 flex flex-1 justify-center rounded-md bg-green-400 px-4 py-2 hover:bg-green-300">
                Player vs Bot
              </button>
            </Link>
          </div>
        </div>
        <div className="px-4 py-8 text-center">🐹 Made with ❤️ by Gio</div>
      </main>
    </>
  );
};

export default Home;
