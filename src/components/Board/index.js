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
            board: [
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x']]
        };
    }

    resetGame = () => {
        this.setState({
            player: 'r',
            board: [
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x'],
                ['x', 'x', 'x', 'x', 'x', 'x']]
        });
    }

    changePlayer = () => {
        if (this.state.player === 'r') this.setState({ player: 'y' });
        else this.setState({ player: 'r' });
    }

    makeMove = (colIndex) => {
        const { board, player } = this.state;
        // Check if move is valid
        if (colIndex === null || colIndex < 0 || colIndex > 6) return;
        let heightIndex = board[colIndex].findIndex(el => el !== 'r' && el !== 'y');
        if (heightIndex === -1) return;

        console.log(`${players[player]} player on col ${colIndex}`);

        //Deep copy array to avoid modifying state directly
        let newBoard = JSON.parse(JSON.stringify(board));
        // Update board state with move made
        newBoard[colIndex][heightIndex] = player;
        // Checks state of game after the move made
        this.setState({ board: newBoard }, this.gameStateCheck);
    }

    gameStateCheck = () => {
        const { player } = this.state;
        // Checks for win condition or tie, else game continues
        if (this.checkWin()) {
            alert(`${players[player]} player won!`);
            this.resetGame();
        } else if (this.boardIsFull()) {
            alert(`It was a tie!`);
            this.resetGame();
        }
        else {
            this.changePlayer();
        }
    }

    checkWin = () => {
        let { board, player } = this.state;
        // Check verticals
        for (const col of board) {
            if (col[2] === col[3] && col[3] === player) {
                if ((col[0] === player && col[1] === player)
                    || (col[1] === player && col[4] === player)
                    || (col[4] === player && col[5] === player)
                ) return true;
            }
        }

        // Check horizontals
        for (const row in board) {
            if (board[3][row] === player) {
                for (let col = 0; col < 4; col++) {
                    if (board[col][row] === player
                        && board[col + 1][row] === player
                        && board[col + 2][row] === player
                        && board[col + 3][row] === player
                    ) return true;
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
                ) return true;

                // Downwards
                if (board[col][boardHeight - offset] === player &&
                    board[col + 1][boardHeight - (offset + 1)] === player &&
                    board[col + 2][boardHeight - (offset + 2)] === player &&
                    board[col + 3][boardHeight - (offset + 3)] === player
                ) return true;
            }
        }

        return false;
    }

    boardIsFull = () => {
        let { board } = this.state;
        for (const col of board) {
            if (col[col.length - 1] === 'x') {
                return false;
            }
        }
        return true;
    }


    displayCell = (cell, i) => {
        if (cell === 'r') return <div className='circle red' colindex={i} />
        else if (cell === 'y') return <div className='circle yellow' colindex={i} />
        return <div className='circle empty' colindex={i} />;
    }

    colClicked = e => {
        this.makeMove(parseInt(e.target.getAttribute('colindex')));
    }

    render() {
        const { board, player } = this.state;

        return (
            <>
                <button className='btn' onClick={this.resetGame}>Reset Game</button>
                <div style={{ marginTop: '0.2em' }}>It is {players[player]}'s turn</div>
                <div id='board'>
                    {board.map((col, i) => (
                        <div className='board-col' key={i} colindex={i} onClick={this.colClicked}>
                            {col.map((cell, j) => (
                                <div className='board-cell' key={j} colindex={i}>{this.displayCell(cell, i)}</div>
                            ))}
                        </div>
                    ))}
                </div>
            </>
        );
    }
}

export default Board;