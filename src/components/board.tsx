import { ReactNode } from "react";
import Position from "../game/Position";

interface BoardProps {
  readonly position: Position;
  readonly makeMove: (col: bigint) => void;
}

const Board: React.FC<BoardProps> = ({ position, makeMove }) => {
  const boardRepresentation: ReactNode[] = [];

  const winningPieces = position.winningPieces();

  const getPositionCol = (col: bigint): ReactNode => {
    const n = (position.key() >> (col * (Position.HEIGHT + 1n))) & 0x7fn; // 0x7f => 0111 1111

    let height = Position.HEIGHT + 1n;
    let pos = n;

    while (height && pos === n) {
      pos &= (1n << (height - 1n)) - 1n;
      height--;
    }

    const stonesToRender = Array(Number(Position.HEIGHT)).fill("✖");

    for (let i = 0n; i < height; i++) {
      let element = (pos & 1n) === position.nbMoves() % 2n ? "🔴" : "🟡";

      if (winningPieces & (1n << (col * (Position.HEIGHT + 1n) + i))) {
        element = (pos & 1n) === position.nbMoves() % 2n ? "❌" : "🌟";
      }

      stonesToRender[Number(Position.HEIGHT - 1n - i)] = element;
      pos >>= 1n;
    }

    return (
      <div className="min-w-max">
        {stonesToRender.map((cell, index) => (
          <div
            key={index}
            className="h-[1.25em] w-[1.25em] text-center text-7xl font-semibold"
          >
            {cell}
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
        className="select-none rounded-xl p-2 hover:bg-blue-400"
      >
        {getPositionCol(col)}
      </div>
    );
  }

  return (
    <div className="flex columns-7 rounded-xl bg-blue-500 font-mono">
      {boardRepresentation}
    </div>
  );
};

export default Board;
