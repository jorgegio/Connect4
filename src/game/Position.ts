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
  public static readonly WIDTH: number = 7; // width of the board
  public static readonly HEIGHT: number = 6; // height of the board

  public static readonly MIN_SCORE: number =
    -(Position.WIDTH * Position.HEIGHT) / 2 + 3;
  public static readonly MAX_SCORE: number =
    (Position.WIDTH * Position.HEIGHT + 1) / 2 - 3;

  constructor() {
    this.current_position = 0;
    this.mask = 0;
    this.moves = 0;
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
  public play(move: number) {
    this.current_position ^= this.mask;
    this.mask |= move;
    this.moves++;
  }

  /*
   * Plays a sequence of successive played columns, mainly used to initilize a board.
   * @param seq: a sequence of digits corresponding to the 1-based index of the column played.
   *
   * @return number of played moves. Processing will stop at first invalid move that can be:
   *           - invalid character (non digit, or digit >= WIDTH)
   *           - playing a colum the is already full
   *           - playing a column that makes an alignment (we only solve non).
   *         Caller can check if the move sequence was valid by comparing the number of
   *         processed moves to the length of the sequence.
   */
  public play_seq(seq: string): number {
    for (let i = 0; i < seq.length; i++) {
      const col: number = seq.charCodeAt(i) - "1".charCodeAt(0);
      if (
        col < 0 ||
        col >= Position.WIDTH ||
        !this.canPlay(col) ||
        this.isWinningMove(col)
      )
        return i; // invalid move
      this.playCol(col);
    }
    return seq.length;
  }

  /**
   * return true if current player can win next move
   */
  public canWinNext(): boolean {
    return (this.winning_position() & this.possible()) !== 0;
  }

  /**
   * @return number of moves played from the beginning of the game.
   */
  public nbMoves(): number {
    return this.moves;
  }

  /**
   * @return a compact representation of a position on WIDTH*(HEIGHT+1) bits.
   */
  public key(): number {
    return this.current_position + this.mask;
  }

  /**
   * Build a symmetric base 3 key. Two symetric positions will have the same key.
   *
   * This key is a base 3 representation of the sequence of played moves column per column,
   * from bottom to top. The 3 digits are top_of_colum(0), current_player(1), opponent(2).
   *
   * example: game "45" where player one played colum 4, then player two played column 5
   * has a representation in base 3 digits : 0 0 0 1 0 2 0 0 0 or : 3*3^3 + 1*3^5
   *
   * The symetric key is the mimimum key of the two keys built iterating columns from left to righ or right to left.
   *
   * as the last digit is always 0, we omit it and a base 3 key
   * uses N = (nbMoves + nbColums - 1) base 3 digits or N*log2(3) bits.
   */
  public key3(): number {
    let key_forward = 0;
    for (let i = 0; i < Position.WIDTH; i++) {
      key_forward = this.partialKey3(key_forward, i); // compute key in increasing order of columns
    }

    let key_reverse = 0;
    for (let i: number = Position.WIDTH; i--; ) {
      key_reverse = this.partialKey3(key_reverse, i); // compute key in decreasing order of columns
    }
    return key_forward < key_reverse ? key_forward / 3 : key_reverse / 3; // take the smallest key and divide per 3 as the last base3 digit is always 0
  }

  /**
   * Return a bitmap of all the possible next moves the do not lose in one turn.
   * A losing move is a move leaving the possibility for the opponent to win directly.
   *
   * Warning this function is intended to test position where you cannot win in one turn
   * If you have a winning move, this function can miss it and prefer to prevent the opponent
   * to make an alignment.
   */
  public possibleNonLosingMoves(): number {
    if (!this.canWinNext()) throw new Error("No non-losing move possible");

    let possible_mask: number = this.possible();
    const opponent_win: number = this.opponent_winning_position();
    const forced_moves: number = possible_mask & opponent_win;
    if (forced_moves) {
      if (forced_moves & (forced_moves - 1))
        // check if there is more than one forced move
        return 0; // the opponnent has two winning moves and you cannot stop him
      else possible_mask = forced_moves; // enforce to play the single forced move
    }
    return possible_mask & ~(opponent_win >> 1); // avoid to play below an opponent winning spot
  }

  /**
   * Score a possible move.
   *
   * @param move, a possible move given in a bitmap format.
   *
   * The score we are using is the number of winning spots
   * the current player has after playing the move.
   */
  public moveScore(move: number): number {
    return Position.popcount(
      Position.compute_winning_position(this.current_position | move, this.mask)
    );
  }

  /**
   * Indicates whether a column is playable.
   * @param col: 0-based index of column to play
   * @return true if the column is playable, false if the column is already full.
   */
  public canPlay(col: number): boolean {
    return (this.mask & Position.top_mask_col(col)) === 0;
  }

  /**
   * Plays a playable column.
   * This function should not be called on a non-playable column or a column making an alignment.
   *
   * @param col: 0-based index of a playable column.
   */
  public playCol(col: number): void {
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
  public isWinningMove(col: number): boolean {
    return (
      (this.winning_position() &
        this.possible() &
        Position.column_mask(col)) !==
      0
    );
  }

  private current_position: number; // bitmap of the current_player stones
  private mask: number; // bitmap of all the already played spots
  private moves: number; // number of moves played since the beginning of the game.

  /**
   * Compute a partial base 3 key for a given column
   */
  private partialKey3(key: number, col: number): number {
    for (
      let pos = 1 << (col * (Position.HEIGHT + 1));
      pos & this.mask;
      pos <<= 1
    ) {
      key *= 3;
      if (pos & this.current_position) key += 1;
      else key += 2;
    }
    key *= 3;

    return key;
  }

  /**
   * Return a bitmask of the possible winning positions for the current player
   */
  private winning_position(): number {
    return Position.compute_winning_position(this.current_position, this.mask);
  }

  /**
   * Return a bitmask of the possible winning positions for the opponent
   */
  private opponent_winning_position(): number {
    return Position.compute_winning_position(
      this.current_position ^ this.mask,
      this.mask
    );
  }

  /**
   * Bitmap of the next possible valid moves for the current player
   * Including losing moves.
   */
  private possible(): number {
    return (this.mask + Position.bottom_mask) & Position.board_mask;
  }

  /**
   * counts number of bit set to one in a 64bits integer
   */
  private static popcount(m: number): number {
    let c = 0;
    for (c = 0; m; c++) {
      m &= m - 1;
    }
    return c;
  }

  /**
   * @parmam position, a bitmap of the player to evaluate the winning pos
   * @param mask, a mask of the already played spots
   *
   * @return a bitmap of all the winning free spots making an alignment
   */
  private static compute_winning_position(
    position: number,
    mask: number
  ): number {
    // vertical;
    let r: number = (position << 1) & (position << 2) & (position << 3);

    //horizontal
    let p: number =
      (position << (Position.HEIGHT + 1)) &
      (position << (2 * (Position.HEIGHT + 1)));
    r |= p & (position << (3 * (Position.HEIGHT + 1)));
    r |= p & (position >> (Position.HEIGHT + 1));
    p =
      (position >> (Position.HEIGHT + 1)) &
      (position >> (2 * (Position.HEIGHT + 1)));
    r |= p & (position << (Position.HEIGHT + 1));
    r |= p & (position >> (3 * (Position.HEIGHT + 1)));

    //diagonal 1
    p = (position << Position.HEIGHT) & (position << (2 * Position.HEIGHT));
    r |= p & (position << (3 * Position.HEIGHT));
    r |= p & (position >> Position.HEIGHT);
    p = (position >> Position.HEIGHT) & (position >> (2 * Position.HEIGHT));
    r |= p & (position << Position.HEIGHT);
    r |= p & (position >> (3 * Position.HEIGHT));

    //diagonal 2
    p =
      (position << (Position.HEIGHT + 2)) &
      (position << (2 * (Position.HEIGHT + 2)));
    r |= p & (position << (3 * (Position.HEIGHT + 2)));
    r |= p & (position >> (Position.HEIGHT + 2));
    p =
      (position >> (Position.HEIGHT + 2)) &
      (position >> (2 * (Position.HEIGHT + 2)));
    r |= p & (position << (Position.HEIGHT + 2));
    r |= p & (position >> (3 * (Position.HEIGHT + 2)));

    return r & (Position.board_mask ^ mask);
  }

  // Static bitmaps
  private static bottom(width: number, height: number): number {
    if (width <= 0) {
      return 0;
    }
    return this.bottom(width - 1, height) | (1 << ((width - 1) * (height + 1)));
  }

  private static readonly bottom_mask: number = Position.bottom(
    Position.WIDTH,
    Position.HEIGHT
  );
  private static readonly board_mask: number =
    Position.bottom_mask * ((1 << Position.HEIGHT) - 1);

  // return a bitmask containg a single 1 corresponding to the top cel of a given column
  private static top_mask_col(col: number): number {
    return 1 << (Position.HEIGHT - 1 + col * (Position.HEIGHT + 1));
  }

  // return a bitmask containg a single 1 corresponding to the bottom cell of a given column
  private static bottom_mask_col(col: number): number {
    return 1 << (col * (Position.HEIGHT + 1));
  }

  // return a bitmask 1 on all the cells of a given column
  public static column_mask(col: number): number {
    return ((1 << Position.HEIGHT) - 1) << (col * (Position.HEIGHT + 1));
  }
}

export default Position;
