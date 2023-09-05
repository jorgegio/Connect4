# Connect 4
Connect 4 TypeScript implementation with bitboards and minimax algorithm solver.\
Based on Pascal Pons' [Connect 4 Game Solver](https://connect4.gamesolver.org/)

<p align="center">
    <a href="https://connect4.jorgegio.dev">
        <img src="public/logo.png" width="256" height="256"/>
    </a>
    <p align="center">
        Try out the game!
        <a href="https://connect4.jorgegio.dev">
            here
        </a>
    </p>
</p>

## Bitboard Encoding

To be able to run the game with a performant solver we need to represent the game state with something better than arrays for each position on the board.

To solve this, a binary bitboard representation is used. \
We use a [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt), where each column of the board is encoded on `HEIGHT + 1` bits.

Example of bit order to encode for a 7x6 board:

```
.  .  .  .  .  .  .
5 12 19 26 33 40 47
4 11 18 25 32 39 46
3 10 17 24 31 38 45
2  9 16 23 30 37 44
1  8 15 22 29 36 43
0  7 14 21 28 35 42
```

`Position` is stored as:
- A bitboard `mask` with 1 on any color stones.
- A bitboard `current_player` with 1 on stones of the current player.

The`current_player` bitboard can be transformed into a compact and non ambiguous key \
by adding an extra bit on top of the last non empty cell of each column.

This allows us to identify all the empty cells whithout needing the `mask` bitboard. 

*current_player "x" = 1, opponent "o" = 0*

| board     | position  | mask      |  key      | bottom
| ---       |   ---     | ---       | ---       | ---
|           | `0000000` | `0000000` | `0000000` | `0000000`
| `.......` | `0000000` | `0000000` | `0001000` | `0000000`
| `...o...` | `0000000` | `0001000` | `0010000` | `0000000`
| `..xx...` | `0011000` | `0011000` | `0011000` | `0000000`
| `..ox...` | `0001000` | `0011000` | `0001100` | `0000000`
| `..oox..` | `0000100` | `0011100` | `0000110` | `0000000`
| `..oxxo.` | `0001100` | `0011110` | `1101101` | `1111111`

*current_player "o" = 1, opponent "x" = 0*

| board     | position  | mask      |  key      | bottom
| ---       |   ---     | ---       | ---       | ---
|           | `0000000` | `0000000` | `0001000` | `0000000`
| `...x...` | `0000000` | `0001000` | `0000000` | `0000000`
| `...o...` | `0001000` | `0001000` | `0011000` | `0000000`
| `..xx...` | `0000000` | `0011000` | `0000000` | `0000000`
| `..ox...` | `0010000` | `0011000` | `0010100` | `0000000`
| `..oox..` | `0011000` | `0011100` | `0011010` | `0000000`
| `..oxxo.` | `0010010` | `0011110` | `1110011` | `1111111`

A `key` is a unique representation of a board: `key = position + mask + bottom`\
In practice, as bottom is constant, `key = position + mask` is also a non-ambigous representation of the position.

## Solver

The solver consists of a [minimax search algorithm](https://en.wikipedia.org/wiki/Minimax) with a combination of different optimizations: 

### Alpha-Beta Pruning
[Alpha-beta pruning](https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning) leverages the fact that you do not always need to fully explore all possible game paths to compute the score of a position. \
For example, if it’s your turn and you already know that you can have a score of at least 10 by playing a given move, there is no need to explore for scores lower than 10 on other possible moves.

#### Iterative Deepening
[Iterative deepening](https://www.chessprogramming.org/Iterative_Deepening) consists in exploring the search tree at a shallow depth first and then iteratively deeper. It allows to find shallow winning path earlier and can also allow to keep in transposition table the early results of the previous explorations. It helps next iterations to prune the tree exploration more efficiently.

#### Null Window
A [Null Window](https://www.chessprogramming.org/Null_Window) is a way to reduce the search space in alpha-beta like search algorithms, to perform a boolean test, whether a move produces a worse or better score than a passed value.

This techniques uses a minimal size window `[alpha; alpha+1]` to test if the score of a position is higher or lower than alpha. An output lower or equal than alpha will tell us that the actual score is lower or equal than alpha. An output higher than alpha will tell us that the actual score is higher than alpha. Having a very narrow windows allow more pruning and faster answer.

### Move Exploration Order
To improve the exploration order a static column order strategy is used, exploring center columns first and edge columns at the end. \
Center columns are on average better moves in Connect 4 because they are involved in more possible alignments.

### Opening Book
An opening book is used to load a set of scores for opening moves to reduce compute costs for the solver by having the most expensive moves pre-computed.

## Limitations

### BigInt
All of the bitboard logic for the game has been implemented using BigInt types, since [bitwise operations only have 32-bit precision in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#fixed-width_number_conversion). 

### Client-side Opening Book
The opening book used for this implementation has been greatly reduced in size to allow offline play (at the cost of having a smaller pool of known moves for the solver to work off of).

Ideally the game would be implemented with a server-side Solver, which would greatly reduce the network footprint for the client by avoiding loading the opening book locally. However, it was a design decision to set this up to work offline as a fun, small project.
