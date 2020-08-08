import React, { Component } from 'react';
import './Board.css';
import * as game from './gameLogic';

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

    makeMove = colIndex => {
        const { board, player } = this.state;
        // Check if move is valid
        if (!game.canPlay(board, colIndex)) return;
        console.log(`${players[player]} player on col ${colIndex}`);
        // Update board state with move made
        let newBoard = game.play(board, player, colIndex);
        this.setState({ board: newBoard });
        // Checks state of game after the move made
        this.gameStateCheck(newBoard, player);
    }

    gameStateCheck = (board, player) => {
        // Checks for win condition or tie, else game continues
        let winPieces = game.checkWin(board, player);
        if (winPieces.length >= 4) {
            this.setState({ gameStateLabel: `${players[player]} won!`, gameActive: false, winningPieces: winPieces });
        } else if (game.boardIsFull(board)) {
            this.setState({ gameStateLabel: `It was a tie!`, gameActive: false });
        }
        else {
            let newPlayer = game.changePlayer(player);
            this.setState({
                player: newPlayer,
                gameStateLabel: `It is ${players[newPlayer]}'s turn`
            });
        }
    }

    displayCell = (cell, col, row) => {
        let x = this.state.winningPieces.includes(game.coordID(col, row)) ? <div className='x' colindex={col} /> : '';
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