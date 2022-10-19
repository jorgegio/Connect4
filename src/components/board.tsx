import { ReactNode } from "react";

interface BoardProps {
  readonly positionKey: bigint;
  readonly makeMove: (col: bigint) => void;
}

const Board: React.FC<BoardProps> = ({ positionKey, makeMove }) => {
  const boardRepresentation: ReactNode[] = [];

  const getPositionCol = (col: bigint): ReactNode => {
    const n = (positionKey >> (col * BigInt(7))) & BigInt(0x3f);
    const colArr = n.toString(2).padStart(7, "0").split("");

    return (
      <div className="container flex flex-col px-4">
        {colArr.map((cell, index) => (
          <div key={index} className="text-xl font-semibold">
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
