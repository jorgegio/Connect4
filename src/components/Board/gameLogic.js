export const boardIsFull = (board) => {
    for (const col of board) {
        if (col[col.length - 1] === 'x') {
            return false;
        }
    }
    return true;
}

export const coordID = (col, row) => {
    return col * 7 + row
}

export const changePlayer = (player) => {
    let newPlayer = 'r';
    if (player === 'r') newPlayer = 'y';
    return newPlayer;
}

export const canPlay = (board, colIndex) => {
    if (colIndex === null || colIndex < 0 || colIndex > 6) return false;
    let heightIndex = board[colIndex].findIndex(el => el === 'x');
    return heightIndex !== -1;
}

export const play = (board, player, colIndex) => {
    //Deep copy array to avoid modifying state directly
    let newBoard = JSON.parse(JSON.stringify(board));
    let heightIndex = newBoard[colIndex].findIndex(el => el === 'x');
    newBoard[colIndex][heightIndex] = player;
    return newBoard;
}

export const checkWin = (board, player) => {
    if (!board || !player) return [];
    // Check verticals
    for (let col = 0; col < board.length; col++) {
        for (let row = 0; row < 4; row++) {
            if (board[col][row] === player
                && board[col][row + 1] === player
                && board[col][row + 2] === player
                && board[col][row + 3] === player
                ) return [
                coordID(col, row),
                coordID(col, row + 1),
                coordID(col, row + 2),
                coordID(col, row + 3)
            ];
        }
    }

    // Check horizontals
    for (let row = 0; row < board[0].length; row++) {
        if (board[3][row] === player) {
            for (let col = 0; col < 4; col++) {
                if (board[col][row] === player
                    && board[col + 1][row] === player
                    && board[col + 2][row] === player
                    && board[col + 3][row] === player
                ) return [
                    coordID(col, row),
                    coordID(col + 1, row),
                    coordID(col + 2, row),
                    coordID(col + 3, row)
                ];
            }
        }
    }

    let boardHeight = board[0].length - 1;
    // Check diagonals
    for (let col = 0; col < 4; col++) {
        for (let offset = 0; offset < 3; offset++) {
            // Upwards
            if (board[col][offset] === player &&
                board[col + 1][offset + 1] === player &&
                board[col + 2][offset + 2] === player &&
                board[col + 3][offset + 3] === player
            ) return [
                coordID(col, offset),
                coordID(col + 1, offset + 1),
                coordID(col + 2, offset + 2),
                coordID(col + 3, offset + 3)
            ];

            // Downwards
            if (board[col][boardHeight - offset] === player &&
                board[col + 1][boardHeight - (offset + 1)] === player &&
                board[col + 2][boardHeight - (offset + 2)] === player &&
                board[col + 3][boardHeight - (offset + 3)] === player
            ) return [
                coordID(col, boardHeight - offset),
                coordID(col + 1, boardHeight - (offset + 1)),
                coordID(col + 2, boardHeight - (offset + 2)),
                coordID(col + 3, boardHeight - (offset + 3))
            ];
        }
    }

    return [];
}
