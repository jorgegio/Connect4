import Position from "./Position";
import { TranspositionTable } from "./TranspositionTable";
import book from "./tiny_book.json";
import book_extras from "./manual_additions.json";

interface BookFileData {
  data: { key3: number; value: number }[];
  depth: number;
}


class OpeningBook {
  constructor() {
    this.T = new TranspositionTable(8388593); //8388593 prime = 64MB of transposition table
    this.width = Position.WIDTH;
    this.height = Position.HEIGHT;
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
  private load() {
    this.depth = (book as BookFileData).depth;

    (book as BookFileData).data.forEach((entry) => {
      this.T.put(BigInt(entry.key3), BigInt(entry.value));
    });
    (book_extras as BookFileData).data.forEach((entry) => {
      this.T.put(BigInt(entry.key3), BigInt(entry.value));
    });
  }

  public get(P: Position): bigint {
    if (P.nbMoves() > this.depth) return 0n;
    else {
      return this.T.get(P.key3());
    }
  }
}

export default OpeningBook;
