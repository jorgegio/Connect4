import Position from "./Position";
import TranspositionTable from "./TranspositionTable";

class OpeningBook {
  constructor(width: bigint, height: bigint, T: TranspositionTable) {
    this.T = T;
    this.width = width;
    this.height = height;
    this.depth = -1;
    this.load();
  }

  private T: TranspositionTable;
  private readonly width: bigint;
  private readonly height: bigint;
  private depth: number;

  /**
   * Opening book file format:
   * - 1 byte: board width
   * - 1 byte: board height
   * - 1 byte: max stored position depth
   * - 1 byte: key size in bits
   * - 1 byte: value size in bits
   * - 1 byte: log_size = log2(size). number of stored elements (size) is smallest prime number above 2^(log_size)
   * - size key elements
   * - size value elements
   */
  private async load() {
    console.log("inside load function");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const book = require("./7x6_small.iba");

    console.log("exiting load function");
    // console.log("book value:", book);
    // const fileReader = new FileReader();

    // fileReader.onload = function () {
    //   console.log("Reading 7x6_small.iba");
    // };

    // const blob = new Blob(book);

    // fileReader.readAsBinaryString(blob);
  }

  public get(P: Position): bigint {
    if (P.nbMoves() > this.depth) return 0n;
    else return this.T.get(P.key3());
  }
}

export default OpeningBook;
