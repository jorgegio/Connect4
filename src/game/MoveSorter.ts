import Position from "./Position";

interface MoveEntry {
  move: bigint;
  score: bigint;
}

/**
 * This class helps sorting the next moves
 *
 * You have to add moves first with their score
 * then you can get them back in decreasing score
 *
 * This class implement an insertion sort that is in practice very
 * efficient for small number of move to sort (max is Position::WIDTH)
 * and also efficient if the moves are pushed in approximatively increasing
 * order which can be achieved by using a simpler column ordering heuristic.
 */
class MoveSorter {
  /**
   * Build an empty container
   */
  constructor() {
    this.size = 0n;
    this.entries = Array(Number(Position.WIDTH)).fill({ move: 0n, score: 0n });
  }

  /**
   * Add a move in the container with its score.
   * You cannot add more than Position.WIDTH moves
   */
  public add(move: bigint, score: bigint): void {
    let pos = Number(this.size++);
    while (
      pos > 0 &&
      pos <= this.entries.length &&
      this.entries[pos - 1].score > score
    ) {
      this.entries[pos] = this.entries[pos - 1];
      --pos;
    }
    this.entries[pos].move = move;
    this.entries[pos].score = score;
  }

  /**
   * Get next move
   * @return next remaining move with max score and remove it from the container.
   * If no more move is available return 0
   */
  public getNext(): bigint {
    if (this.size > 0 && this.size <= this.entries.length) {
      return this.entries[Number(--this.size)].move;
    }
    return 0n;
  }

  /**
   * reset (empty) the container
   */
  public reset(): void {
    this.size = 0n;
  }

  // bigint of stored moves
  private size: bigint;

  // Contains size moves with their score ordered by score
  private entries: MoveEntry[];
}

export default MoveSorter;
