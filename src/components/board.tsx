import { ReactNode } from "react";
import Position from "../game/Position";

interface BoardProps {
  readonly positionKey: bigint;
  readonly nbMoves: bigint;
  readonly makeMove: (col: bigint) => void;
}

const Board: React.FC<BoardProps> = ({ positionKey, nbMoves, makeMove }) => {
  const boardRepresentation: ReactNode[] = [];

  const getPositionCol = (col: bigint): ReactNode => {
    const n = (positionKey >> (col * Position.WIDTH)) & BigInt(0x7f); // 0x7f => 0111 1111

    let height = Position.WIDTH;
    let pos = n;

    while (height && pos === n) {
      pos &= (1n << (height - 1n)) - 1n;
      height--;
    }

    const stonesToRender = Array(Number(Position.HEIGHT)).fill("✖");

    for (let i = 0n; i < height; i++) {
      const element = (pos & 1n) === nbMoves % 2n ? "🔴" : "🟡";
      stonesToRender[Number(Position.HEIGHT - 1n - i)] = element;
      pos >>= 1n;
    }

    return (
      <div className="container flex flex-col px-4">
        {stonesToRender.map((cell, index) => (
          <div key={index} className="text-xl text-center font-semibold">
            {cell.toString()}
          </div>
        ))}
      </div>
    );
  };

  for (let col = 0n; col < 7n; col++) {
    boardRepresentation.push(
      <div
        key={Number(col)}
        onClick={() => makeMove(col)}
        className="select-none hover:bg-blue-400"
      >
        {getPositionCol(col)}
      </div>
    );
  }

  return (
    <div className="flex columns-7 bg-blue-500 font-mono">
      {boardRepresentation}
    </div>
  );
};

export default Board;
