/**
 * A class storing a Connect 4 position.
 * Functions are relative to the current player to play.
 * Position containing alignment are not supported by this class.
 *
 * A binary bitboard representationis used.
 * Each column is encoded on HEIGH+1 bits.
 *
 * Example of bit order to encode for a 7x6 board
 * .  .  .  .  .  .  .
 * 5 12 19 26 33 40 47
 * 4 11 18 25 32 39 46
 * 3 10 17 24 31 38 45
 * 2  9 16 23 30 37 44
 * 1  8 15 22 29 36 43
 * 0  7 14 21 28 35 42
 *
 * Position is stored as
 * - a bitboard "mask" with 1 on any color stones
 * - a bitboard "current_player" with 1 on stones of current player
 *
 * "current_player" bitboard can be transformed into a compact and non ambiguous key
 * by adding an extra bit on top of the last non empty cell of each column.
 * This allow to identify all the empty cells whithout needing "mask" bitboard
 *
 * current_player "x" = 1, opponent "o" = 0
 * board     position  mask      key       bottom
 *           0000000   0000000   0000000   0000000
 * .......   0000000   0000000   0001000   0000000
 * ...o...   0000000   0001000   0010000   0000000
 * ..xx...   0011000   0011000   0011000   0000000
 * ..ox...   0001000   0011000   0001100   0000000
 * ..oox..   0000100   0011100   0000110   0000000
 * ..oxxo.   0001100   0011110   1101101   1111111
 *
 * current_player "o" = 1, opponent "x" = 0
 * board     position  mask      key       bottom
 *           0000000   0000000   0001000   0000000
 * ...x...   0000000   0001000   0000000   0000000
 * ...o...   0001000   0001000   0011000   0000000
 * ..xx...   0000000   0011000   0000000   0000000
 * ..ox...   0010000   0011000   0010100   0000000
 * ..oox..   0011000   0011100   0011010   0000000
 * ..oxxo.   0010010   0011110   1110011   1111111
 *
 * key is an unique representation of a board key = position + mask + bottom
 * in practice, as bottom is constant, key = position + mask is also a
 * non-ambigous representation of the position.
 */
class Position {
  public static readonly WIDTH: bigint = 7n; // width of the board
  public static readonly HEIGHT: bigint = 6n; // height of the board

  public static readonly MIN_SCORE: bigint =
    -(Position.WIDTH * Position.HEIGHT) / 2n + 3n;
  public static readonly MAX_SCORE: bigint =
    (Position.WIDTH * Position.HEIGHT + 1n) / 2n - 3n;

  constructor() {
    this.current_position = 0n;
    this.mask = 0n;
    this.moves = 0n;
  }

  // Copy constructor
  public static clone(P: Position) {
    const P2: Position = new Position();
    P2.current_position = P.current_position;
    P2.mask = P.mask;
    P2.moves = P.moves;

    return P2;
  }

  /**
   * Plays a possible move given by its bitmap representation
   *
   * @param move: a possible move given by its bitmap representation
   *        only one bit of the bitmap should be set to 1
   *        the move should be a valid possible move for the current player
   */
  public play(move: bigint) {
    this.current_position ^= this.mask;
    this.mask |= move;
    this.moves++;
  }

  /**
   * return true if current player can win next move
   */
  public canWinNext(): boolean {
    return (this.winning_position() & this.possible()) !== 0n;
  }

  /**
   * @return number of moves played from the beginning of the game.
   */
  public nbMoves(): bigint {
    return this.moves;
  }

  /**
   * @return a compact representation of a position on WIDTH*(HEIGHT+1) bits.
   */
  public key(): bigint {
    return this.current_position + this.mask + Position.bottom_mask;
  }

  /**
   * Build a symmetric base 3 key. Two symetric positions will have the same key.
   *
   * This key is a base 3 representation of the sequence of played moves column per column,
   * from bottom to top. The 3 digits are top_of_column(0), current_player(1), opponent(2).
   *
   * example: game "45" where player one played column 4, then player two played column 5
   * has a representation in base 3 digits : 0 0 0 1 0 2 0 0 0 or : 3*3^3 + 1n*3^5
   *
   * The symetric key is the mimimum key of the two keys built iterating columns from left to righ or right to left.
   *
   * as the last digit is always 0, we omit it and a base 3 key
   * uses N = (nbMoves + nbColumns - 1n) base 3 digits or N*log2(3) bits.
   */
  public key3(): bigint {
    let key_forward = 0n;
    for (let i = 0n; i < Position.WIDTH; i++) {
      key_forward = this.partialKey3(key_forward, i); // compute key in increasing order of columns
    }

    let key_reverse = 0n;
    for (let i: bigint = Position.WIDTH; i--; ) {
      key_reverse = this.partialKey3(key_reverse, i); // compute key in decreasing order of columns
    }
    return key_forward < key_reverse ? key_forward / 3n : key_reverse / 3n; // take the smallest key and divide per 3 as the last base3 digit is always 0
  }

  /**
   * Return a bitmap of all the possible next moves that do not lose in one turn.
   * A losing move is a move leaving the possibility for the opponent to win directly.
   *
   * Warning this function is intended to test position where you cannot win in one turn
   * If you have a winning move, this function can miss it and prefer to prevent the opponent
   * to make an alignment.
   */
  public possibleNonLosingMoves(): bigint {
    if (this.canWinNext()) throw new Error("No non-losing move possible");

    let possible_mask: bigint = this.possible();
    const opponent_win: bigint = this.opponent_winning_position();
    const forced_moves: bigint = possible_mask & opponent_win;
    if (forced_moves) {
      if (forced_moves & (forced_moves - 1n))
        // check if there is more than one forced move
        return 0n;
      // the opponnent has two winning moves and you cannot stop him
      else possible_mask = forced_moves; // enforce to play the single forced move
    }
    return possible_mask & ~(opponent_win >> 1n); // avoid to play below an opponent winning spot
  }

  /**
   * Score a possible move.
   *
   * @param move, a possible move given in a bitmap format.
   *
   * The score we are using is the number of winning spots
   * the current player has after playing the move.
   */
  public moveScore(move: bigint): bigint {
    return Position.popcount(
      Position.compute_winning_position(this.current_position | move, this.mask)
    );
  }

  /**
   * Indicates whether a column is playable.
   * @param col: 0-based index of column to play
   * @return true if the column is playable, false if the column is already full.
   */
  public canPlay(col: bigint): boolean {
    return (this.mask & Position.top_mask_col(col)) === 0n;
  }

  /**
   * Plays a playable column.
   * This function should not be called on a non-playable column or a column making an alignment.
   *
   * @param col: 0-based index of a playable column.
   */
  public playCol(col: bigint): void {
    this.play(
      (this.mask + Position.bottom_mask_col(col)) & Position.column_mask(col)
    );
  }

  /**
   * Indicates whether the current player wins by playing a given column.
   * This function should never be called on a non-playable column.
   * @param col: 0-based index of a playable column.
   * @return true if current player makes an alignment by playing the corresponding column col.
   */
  public isWinningMove(col: bigint): boolean {
    return (
      (this.winning_position() &
        this.possible() &
        Position.column_mask(col)) !==
      0n
    );
  }

  public isGameOver(): boolean {
    return (
      this.moves + 1n >= Position.WIDTH * Position.HEIGHT ||
      this.winningPieces() !== 0n
    );
  }

  public winningPieces(): bigint {
    const position = this.current_position ^ this.mask;

    // check \ diagonal
    const diag1 = position & (position >> Position.HEIGHT);
    if (diag1 & (diag1 >> (2n * Position.HEIGHT))) {
      let pieces = diag1 & (diag1 >> (2n * Position.HEIGHT));

      pieces |= pieces << Position.HEIGHT;
      pieces |= pieces << (2n * Position.HEIGHT);

      return pieces;
    }

    // check horizontal -
    const hori = position & (position >> (Position.HEIGHT + 1n));
    if (hori & (hori >> (2n * (Position.HEIGHT + 1n)))) {
      let pieces = hori & (hori >> (2n * (Position.HEIGHT + 1n)));

      pieces |= pieces << (Position.HEIGHT + 1n);
      pieces |= pieces << (2n * (Position.HEIGHT + 1n));

      return pieces;
    }

    // check / diagonal
    const diag2 = position & (position >> (Position.HEIGHT + 2n));
    if (diag2 & (diag2 >> (2n * (Position.HEIGHT + 2n)))) {
      let pieces = diag2 & (diag2 >> (2n * (Position.HEIGHT + 2n)));

      pieces |= pieces << (Position.HEIGHT + 2n);
      pieces |= pieces << (2n * (Position.HEIGHT + 2n));

      return pieces;
    }

    // check vertical
    const vert = position & (position >> 1n);
    if (vert & (vert >> 2n)) {
      let pieces = vert & (vert >> 2n);

      pieces |= pieces << 1n;
      pieces |= pieces << 2n;

      return pieces;
    }

    return 0n;
  }

  private current_position: bigint; // bitmap of the current_player stones
  private mask: bigint; // bitmap of all the already played spots
  private moves: bigint; // number of moves played since the beginning of the game.

  /**
   * Compute a partial base 3 key for a given column
   */
  private partialKey3(key: bigint, col: bigint): bigint {
    for (
      let pos = 1n << (col * (Position.HEIGHT + 1n));
      pos & this.mask;
      pos <<= 1n
    ) {
      key *= 3n;
      if (pos & this.current_position) key += 1n;
      else key += 2n;
    }
    key *= 3n;

    return key;
  }

  /**
   * Return a bitmask of the possible winning positions for the current player
   */
  private winning_position(): bigint {
    return Position.compute_winning_position(this.current_position, this.mask);
  }

  /**
   * Return a bitmask of the possible winning positions for the opponent
   */
  private opponent_winning_position(): bigint {
    return Position.compute_winning_position(
      this.current_position ^ this.mask,
      this.mask
    );
  }

  /**
   * Bitmap of the next possible valid moves for the current player
   * Including losing moves.
   */
  private possible(): bigint {
    return (this.mask + Position.bottom_mask) & Position.board_mask;
  }

  /**
   * counts number of bits set to one in a bigint
   */
  private static popcount(m: bigint): bigint {
    let c = 0n;
    for (; m; c++) {
      m &= m - 1n;
    }
    return c;
  }

  /**
   * @param position, a bitmap of the player to evaluate the winning pos
   * @param mask, a mask of the already played spots
   *
   * @return a bitmap of all the winning free spots making an alignment
   */
  private static compute_winning_position(
    position: bigint,
    mask: bigint
  ): bigint {
    // vertical;
    let r: bigint = (position << 1n) & (position << 2n) & (position << 3n);

    //horizontal
    let p: bigint =
      (position << (Position.HEIGHT + 1n)) &
      (position << (2n * (Position.HEIGHT + 1n)));
    r |= p & (position << (3n * (Position.HEIGHT + 1n)));
    r |= p & (position >> (Position.HEIGHT + 1n));
    p =
      (position >> (Position.HEIGHT + 1n)) &
      (position >> (2n * (Position.HEIGHT + 1n)));
    r |= p & (position << (Position.HEIGHT + 1n));
    r |= p & (position >> (3n * (Position.HEIGHT + 1n)));

    //diagonal 1
    p = (position << Position.HEIGHT) & (position << (2n * Position.HEIGHT));
    r |= p & (position << (3n * Position.HEIGHT));
    r |= p & (position >> Position.HEIGHT);
    p = (position >> Position.HEIGHT) & (position >> (2n * Position.HEIGHT));
    r |= p & (position << Position.HEIGHT);
    r |= p & (position >> (3n * Position.HEIGHT));

    //diagonal 2
    p =
      (position << (Position.HEIGHT + 2n)) &
      (position << (2n * (Position.HEIGHT + 2n)));
    r |= p & (position << (3n * (Position.HEIGHT + 2n)));
    r |= p & (position >> (Position.HEIGHT + 2n));
    p =
      (position >> (Position.HEIGHT + 2n)) &
      (position >> (2n * (Position.HEIGHT + 2n)));
    r |= p & (position << (Position.HEIGHT + 2n));
    r |= p & (position >> (3n * (Position.HEIGHT + 2n)));

    return r & (Position.board_mask ^ mask);
  }

  // Static bitmaps
  private static bottom(width: bigint, height: bigint): bigint {
    if (width <= 0n) {
      return 0n;
    }
    return (
      this.bottom(width - 1n, height) | (1n << ((width - 1n) * (height + 1n)))
    );
  }

  public static readonly bottom_mask: bigint = Position.bottom(
    Position.WIDTH,
    Position.HEIGHT
  );
  private static readonly board_mask: bigint =
    Position.bottom_mask * ((1n << Position.HEIGHT) - 1n);

  // return a bitmask containg a single 1 corresponding to the top cel of a given column
  private static top_mask_col(col: bigint): bigint {
    return 1n << (Position.HEIGHT - 1n + col * (Position.HEIGHT + 1n));
  }

  // return a bitmask containg a single 1 corresponding to the bottom cell of a given column
  private static bottom_mask_col(col: bigint): bigint {
    return 1n << (col * (Position.HEIGHT + 1n));
  }

  // return a bitmask 1 on all the cells of a given column
  public static column_mask(col: bigint): bigint {
    return ((1n << Position.HEIGHT) - 1n) << (col * (Position.HEIGHT + 1n));
  }
}

export default Position;
