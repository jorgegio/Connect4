import React, { Component } from 'react';
import './Board.css';

const players = {
    r: 'Red',
    y: 'Yellow'
};

class Board extends Component {

    constructor(props) {
        super(props);
        this.state = {
            player: 'r',
            gameStateLabel: `It is ${players['r']}'s turn`,
            gameActive: true,
            board: [
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x']],
            winningPieces: []
        };
    }

    resetGame = () => {
        this.setState({
            player: 'r',
            gameStateLabel: `It is ${players['r']}'s turn`,
            gameActive: true,
            board: [
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x']],
            winningPieces: []
        });
    }

    changePlayer = (player) => {
        let newPlayer = 'r';
        if (player === 'r') newPlayer = 'y';
        return newPlayer;
    }

    canPlay = (board, colIndex) => {
        if (colIndex === null || colIndex < 0 || colIndex > 6) return false;
        let heightIndex = board[colIndex].findIndex(el => el === 'x');
        return heightIndex !== -1;
    }

    play = (board, player, colIndex) => {
        let heightIndex = board[colIndex].findIndex(el => el === 'x');
        board[colIndex][heightIndex] = player;
    }

    makeMove = colIndex => {
        const { board, player } = this.state;
        // Check if move is valid
        if (!this.canPlay(board, colIndex)) return;
        console.log(`${players[player]} player on col ${colIndex}`);
        //Deep copy array to avoid modifying state directly
        let newBoard = JSON.parse(JSON.stringify(board));
        // Update board state with move made
        this.play(newBoard, player, colIndex);
        // Checks state of game after the move made
        this.setState({ board: newBoard });
        this.gameStateCheck(newBoard, player);
    }

    gameStateCheck = (board, player) => {
        // Checks for win condition or tie, else game continues
        let winPieces = this.checkWin(board, player);
        if (winPieces.length >= 4) {
            this.setState({ gameStateLabel: `${players[player]} won!`, gameActive: false, winningPieces: winPieces });
        } else if (this.boardIsFull(board)) {
            this.setState({ gameStateLabel: `It was a tie!`, gameActive: false });
        }
        else {
            let newPlayer = this.changePlayer(player);
            this.setState({
                player: newPlayer,
                gameStateLabel: `It is ${players[newPlayer]}'s turn`
            });
        }
    }

    checkWin = (board, player) => {
        if (!board || !player) return [];
        // Check verticals
        for (let col = 0; col < board.length; col++) {
            for (let row = 0; row < 4; row++) {
                if (board[col][row] === player
                    && board[col][row + 1] === player
                    && board[col][row + 2] === player
                    && board[col][row + 3] === player
                ) return [
                    this.coordID(col, row),
                    this.coordID(col, row + 1),
                    this.coordID(col, row + 2),
                    this.coordID(col, row + 3)
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
                        this.coordID(col, row),
                        this.coordID(col + 1, row),
                        this.coordID(col + 2, row),
                        this.coordID(col + 3, row)
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
                    this.coordID(col, offset),
                    this.coordID(col + 1, offset + 1),
                    this.coordID(col + 2, offset + 2),
                    this.coordID(col + 3, offset + 3)
                ];

                // Downwards
                if (board[col][boardHeight - offset] === player &&
                    board[col + 1][boardHeight - (offset + 1)] === player &&
                    board[col + 2][boardHeight - (offset + 2)] === player &&
                    board[col + 3][boardHeight - (offset + 3)] === player
                ) return [
                    this.coordID(col, boardHeight - offset),
                    this.coordID(col + 1, boardHeight - (offset + 1)),
                    this.coordID(col + 2, boardHeight - (offset + 2)),
                    this.coordID(col + 3, boardHeight - (offset + 3))
                ];
            }
        }

        return [];
    }

    boardIsFull = (board) => {
        for (const col of board) {
            if (col[col.length - 1] === 'x') {
                return false;
            }
        }
        return true;
    }

    coordID = (col, row) => {
        return col * 7 + row
    }

    displayCell = (cell, col, row) => {
        let x = this.state.winningPieces.includes(this.coordID(col, row)) ? <div className='x' colindex={col} /> : '';
        if (cell === 'r') return <div className='circle red' colindex={col}>{x}</div>
        else if (cell === 'y') return <div className='circle yellow' colindex={col} >{x}</div>
        return <div className='circle empty' colindex={col} />;
    }

    colClicked = e => {
        if (!this.state.gameActive) return;
        this.makeMove(parseInt(e.target.getAttribute('colindex')));
    }

    render() {
        const { board, gameStateLabel } = this.state;

        return (
            <>
                <button className='btn' onClick={this.resetGame}>Reset Game</button>
                <div style={{ marginTop: '0.2em' }}>{gameStateLabel}</div>
                <div id='board'>
                    {board.map((col, i) => (
                        <div className='board-col' key={i} colindex={i} onClick={this.colClicked}>
                            {col.map((cell, j) => (
                                <div className='board-cell' key={j} colindex={i}>{this.displayCell(cell, i, j)}</div>
                            ))}
                        </div>
                    ))}
                </div>
            </>
        );
    }
}

export default Board;