import MoveSorter from "./MoveSorter";
import Position from "./Position";
import TranspositionTable from "./TranspositionTable";

class Solver {
  constructor() {
    this.transTable = new TranspositionTable();
    // this.book =
    this.nodeCount = 0;
    this.columnOrder = [];

    for (let i = 0; i < Position.WIDTH; i++) {
      // initialize the column exploration order, starting with center columns
      this.columnOrder[i] =
        Position.WIDTH / 2 + ((1 - 2 * (i % 2)) * (i + 1)) / 2; // example for WIDTH=7: columnOrder = {3, 4, 2, 5, 1, 6, 0}
    }
  }

  private transTable: TranspositionTable;
  //   private book: OpeningBook; // opening book
  private nodeCount: number; // counter of explored nodes.
  private columnOrder: number[]; // column exploration order

  /**
   * Recursively score connect 4 position using negamax variant of alpha-beta algorithm.
   * @param P: position to evaluate, this function assumes nobody already won and
   *         current player cannot win next move. This has to be checked before
   * @param alpha: alpha < beta, a score window within which we are evaluating the position.
   * @param beta: alpha < beta, a score window within which we are evaluating the position.
   *
   * @return the exact score, an upper or lower bound score depending of the case:
   * - if actual score of position <= alpha then actual score <= return value <= alpha
   * - if actual score of position >= beta then beta <= return value <= actual score
   * - if alpha <= actual score <= beta then return value = actual score
   */
  private negamax(P: Position, alpha: number, beta: number): number {
    this.nodeCount++; // increment counter of explored nodes

    const possible: number = P.possibleNonLosingMoves();

    // if no possible non losing move, opponent wins next move
    if (possible === 0) {
      return -(Position.WIDTH * Position.HEIGHT - P.nbMoves()) / 2;
    }

    // check for draw game
    if (P.nbMoves() >= Position.WIDTH * Position.HEIGHT - 2) {
      return 0;
    }

    let min: number = -(Position.WIDTH * Position.HEIGHT - 2 - P.nbMoves()) / 2; // lower bound of score as opponent cannot win next move
    if (alpha < min) {
      alpha = min; // there is no need to keep alpha below our max possible score.
      if (alpha >= beta) return alpha; // prune the exploration if the [alpha;beta] window is empty.
    }

    let max: number = (Position.WIDTH * Position.HEIGHT - 1 - P.nbMoves()) / 2; // upper bound of our score as we cannot win immediately
    if (beta > max) {
      beta = max; // there is no need to keep beta above our max possible score.
      if (alpha >= beta) return beta; // prune the exploration if the [alpha;beta] window is empty.
    }

    const key: number = P.key();
    const val = this.transTable.get(key);
    if (val) {
      if (val > Position.MAX_SCORE - Position.MIN_SCORE + 1) {
        // we have an lower bound
        min = val + 2 * Position.MIN_SCORE - Position.MAX_SCORE - 2;
        if (alpha < min) {
          alpha = min; // there is no need to keep beta above our max possible score.
          if (alpha >= beta) return alpha; // prune the exploration if the [alpha;beta] window is empty.
        }
      } else {
        // we have an upper bound
        max = val + Position.MIN_SCORE - 1;
        if (beta > max) {
          beta = max; // there is no need to keep beta above our max possible score.
          if (alpha >= beta) return beta; // prune the exploration if the [alpha;beta] window is empty.
        }
      }
    }

    // look for solutions stored in opening book
    //   val = book.get(P);
    //   if(val) return val + Position.MIN_SCORE - 1;

    const moves: MoveSorter = new MoveSorter();
    for (let i = Position.WIDTH; i--; ) {
      const move = possible;
      if (move & Position.column_mask(this.columnOrder[i])) {
        moves.add(move, P.moveScore(move));
      }
    }

    let next: number = moves.getNext();
    while (next) {
      const P2: Position = Position.clone(P);

      P2.play(next); // It's opponent turn in P2 position after current player plays x column.
      const score: number = -this.negamax(P2, -beta, -alpha); // explore opponent's score within [-beta;-alpha] windows:
      // no need to have good precision for score better than beta (opponent's score worse than -beta)
      // no need to check for score worse than alpha (opponent's score worse better than -alpha)

      if (score >= beta) {
        this.transTable.put(
          key,
          score + Position.MAX_SCORE - 2 * Position.MIN_SCORE + 2
        ); // save the lower bound of the position
        return score; // prune the exploration if we find a possible move better than what we were looking for.
      }
      if (score > alpha) alpha = score; // reduce the [alpha;beta] window for next exploration, as we only
      // need to search for a position that is better than the best so far.
      next = moves.getNext();
    }

    this.transTable.put(key, alpha - Position.MIN_SCORE + 1); // save the upper bound of the position
    return alpha;
  }

  public static readonly INVALID_MOVE: number = -1000;

  /**
   *  Returns the score of a position
   */
  public solve(P: Position, weak = false): number {
    // check if win in one move as the Negamax function does not support this case.
    if (P.canWinNext()) {
      return (Position.WIDTH * Position.HEIGHT + 1 - P.nbMoves()) / 2;
    }

    let min: number = -(Position.WIDTH * Position.HEIGHT - P.nbMoves()) / 2;
    let max: number = (Position.WIDTH * Position.HEIGHT + 1 - P.nbMoves()) / 2;
    if (weak) {
      min = -1;
      max = 1;
    }

    while (min < max) {
      // iteratively narrow the min-max exploration window
      let med: number = min + (max - min) / 2;
      if (med <= 0 && min / 2 < med) {
        med = min / 2;
      } else if (med >= 0 && max / 2 > med) {
        med = max / 2;
      }

      // use a null depth window to know if the actual score is greater or smaller than med
      const r = this.negamax(P, med, med + 1);
      if (r <= med) {
        max = r;
      } else {
        min = r;
      }
    }
    return min;
  }

  /** Returns the score off all possible moves of a position as an array.
   * Returns INVALID_MOVE for unplayable columns
   */
  public analyze(P: Position, weak = false): number[] {
    const scores: number[] = Array(Position.WIDTH).fill(Solver.INVALID_MOVE);

    for (let col = 0; col < Position.WIDTH; col++)
      if (P.canPlay(col)) {
        if (P.isWinningMove(col)) {
          scores[col] =
            (Position.WIDTH * Position.HEIGHT + 1 - P.nbMoves()) / 2;
        } else {
          const P2: Position = Position.clone(P);
          P2.playCol(col);
          scores[col] = -this.solve(P2, weak);
        }
      }

    return scores;
  }

  public getNodeCount(): number {
    return this.nodeCount;
  }

  public reset(): void {
    this.nodeCount = 0;
    this.transTable.reset();
  }

  //   public loadBook(book_file: string): void {
  //     this.book.load(book_file);
  //   }
}

export default Solver;