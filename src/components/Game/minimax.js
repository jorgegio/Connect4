import * as game from './gameLogic';

export const negamax = (board, player, depth) => {

    // check for draw
    if (game.boardIsFull(board)) return { score: 0, move: -1 };

    // check if current player can win next move
    for (let x = 0; x < board.length; x++) {
        if (game.isWinningMove(board, player, x)) {
            return { score: (board.length * board[0].length + 1 - game.nbMoves(board)) / 2, move: x };
        }
    }

    let bestScore = -board.length * board[0].length; // init the best possible score with a lower bound of score.
    let bestMove = 0;
    
    // compute the score of all possible next move and keep the best one
    for (let x = 0; x < board.length; x++) {
        if (game.canPlay(board, x)) {
            // It's opponent turn in P2 position after current player plays x column.
            let newBoard = game.play(board, player, x);
            let newPlayer = game.changePlayer(player);
            let newDepth = depth + 1;
            let negamaxResult = negamax(newBoard, newPlayer, newDepth); // If current player plays col x, his score will be the opposite of opponent's score after playing col x
            let score = -negamaxResult.score;

            // keep track of best possible score so far.
            if (score > bestScore) {
                bestScore = score;
                bestMove = x;
            }
        }
    }
    
    console.log(`negamax at depth ${depth} got score: `, bestScore);
    return { score: bestScore, move: bestMove };
}

// If it can win in the next turn, it returns the index in which it needs to play to win, otherwise, it returns -1
export const canWinNext = (board, player) => {
    for (let i in board) {
        if (game.isWinningMove(board, player, i)) return i;
    }
    return -1;
}

export const move = (board, player) => {
    // Checks if win is achievable in 1 move first
    let canWinNextIndex = canWinNext(board, player);
    if (canWinNextIndex !== -1) return canWinNextIndex;

    let bestMove = negamax(board, player, 0).move;
    return bestMove;
}