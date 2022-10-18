import { ReactNode, useState } from "react";
import Position from "../game/Position";

interface BoardProps {
  position: Position;
  playCol: (col: bigint) => void;
}

const getBoardRepresentation = (
  boardState: bigint,
  representationName: string
): ReactNode => {
  const boardStringRepresentation: ReactNode[] = [];

  const getPositionCol = (col: bigint): string => {
    const n = (boardState >> (col * BigInt(7))) & BigInt(0x3f);
    console.log("n", n);
    const rowStr = n.toString(2).padStart(7, "0");

    return rowStr;
  };

  for (let col = 0; col < 7; col++) {
    boardStringRepresentation.push(
      <div
        key={col}
        style={{ writingMode: "vertical-lr", textOrientation: "upright" }}
      >
        {getPositionCol(BigInt(col))}
      </div>
    );
  }

  return (
    <div>
      <div>{representationName}</div>
      <div className="columns-7 bg-cyan-400 font-mono">
        {boardStringRepresentation}
      </div>
    </div>
  );
};

const Board: React.FC<BoardProps> = ({ position, playCol }) => {
  console.log("Current position", position);

  const [positionRepresentation, setPositionRepresentation] = useState(
    getBoardRepresentation(position.current_position, "currentPosition")
  );
  const [maskRepresentation, setMaskRepresentation] = useState(
    getBoardRepresentation(position.mask, "mask")
  );
  const [keyRepresentation, setKeyRepresentation] = useState(
    getBoardRepresentation(position.key(), "key")
  );

  return (
    <div className="m-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const colPlayed = e.target.move.value as number;
          playCol(BigInt(colPlayed));
          setPositionRepresentation(
            getBoardRepresentation(position.current_position, "currentPosition")
          );
          setMaskRepresentation(getBoardRepresentation(position.mask, "mask"));
          setKeyRepresentation(getBoardRepresentation(position.key(), "key"));
        }}
      >
        <input
          name="move"
          type="number"
          min={0}
          max={6}
          defaultValue={0}
          className="mr-4 bg-gray-200 py-2 px-4"
        ></input>
        <button type="submit" className="bg-purple-300 py-2 px-4">
          play move
        </button>
      </form>
      {positionRepresentation}
      {maskRepresentation}
      {keyRepresentation}
    </div>
  );
};

export default Board;
