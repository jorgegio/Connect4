import React, { useEffect, useState } from 'react';
import Board from './board';
import SettingsForm from './settingsForm';
import './connect4.css';
import * as game from './gameLogic';
// import * as bot from './minimax';

const Connect4 = () => {

    const [player, setPlayer] = useState('r');
    const [players, setPlayers] = useState({
        r: {
            name: 'Red',
            type: 'Human'
        },
        y: {
            name: 'Yellow',
            type: 'Human'
        }
    });
    const [gameStateLabel, setGameStateLabel] = useState(`It is Red's turn`);
    const [gameActive, setGameActive] = useState(true);
    const [board, setBoard] = useState(Array.from(Array(7), () => new Array(6).fill('x')));
    const [winningPieces, setWinningPieces] = useState([]);

    useEffect(() => {

        const updateLabel = () => {
            // Non mutating version of gameStateCheck, only to update label with current player data
            let winPieces = game.checkWin(board, player);
            if (winPieces.length >= 4) {
                setGameStateLabel(`${players[player].name} won!`);
            } else if (game.boardIsFull(board)) {
                setGameStateLabel(`It was a tie!`);
            }
            else {
                setGameStateLabel(`It is ${players[player].name}'s turn`);
            }
        }
        
        updateLabel();
      }, [players]);

    const resetGame = () => {
        setPlayer('r');
        setGameStateLabel(`It is ${players.r.name}'s turn`);
        setGameActive(true);
        setBoard(Array.from(Array(7), () => new Array(6).fill('x')));
        setWinningPieces([]);
    }

    const makeMove = colIndex => {
        // Check if move is valid
        if (!game.canPlay(board, colIndex)) return;
        console.log(`${players[player].name} player on col ${colIndex}`);
        // Update board state with move made
        let newBoard = game.play(board, player, colIndex);
        setBoard(newBoard);
        // Checks state of game after the move made
        gameStateCheck(newBoard, player, players);
    }

    const gameStateCheck = (board, player, players) => {
        // Checks for win condition or tie, else game continues
        let winPieces = game.checkWin(board, player);
        if (winPieces.length >= 4) {
            setGameStateLabel(`${players[player].name} won!`);
            setGameActive(false);
            setWinningPieces(winPieces);
        } else if (game.boardIsFull(board)) {
            setGameStateLabel(`It was a tie!`);
            setGameActive(false);
        }
        else {
            let newPlayer = game.changePlayer(player);
            setPlayer(newPlayer);
            setGameStateLabel(`It is ${players[newPlayer].name}'s turn`);
        }
    }

    const displayCell = (cell, col, row) => {
        let x = winningPieces.includes(game.coordID(col, row)) ? <div className='x' colindex={col} /> : '';
        if (cell === 'r') return <div className='circle red' colindex={col}>{x}</div>
        else if (cell === 'y') return <div className='circle yellow' colindex={col} >{x}</div>
        return <div className='circle empty' colindex={col} />;
    }

    const colClicked = e => {
        if (!gameActive || players[player].type !== 'Human') return;
        makeMove(parseInt(e.target.getAttribute('colindex')));
    }

    return (
        <>
            <button className='btn' onClick={resetGame}>Reset Game</button>
            <SettingsForm setPlayers={setPlayers}/>
            <div className='gameStateLabel'>{gameStateLabel}</div>
            <Board board={board} colClicked={colClicked} displayCell={displayCell} />
        </>
    );

}

export default Connect4;