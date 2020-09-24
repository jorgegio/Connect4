import React from 'react';
import './board.css';

const Board = ({ board, colClicked, displayCell }) => {

    return (
        <div id='board'>
            {board.map((col, i) => (
                <div className='board-col' key={i} colindex={i} onClick={colClicked}>
                    {col.map((cell, j) => (
                        <div className='board-cell' key={j} colindex={i}>{displayCell(cell, i, j)}</div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default Board;