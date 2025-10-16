import React, { useState, useEffect } from 'react';
import Cell from './Cell';
import bagIcon1 from '../img/bag_1.svg';
import timeIcon from '../img/cloak.svg';


const Board = ({ rows, cols, mines }) => {
  const [board, setBoard] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const [minesLeft, setMinesLeft] = useState(mines);
  const [revealedCount, setRevealedCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Инициализация доски
  useEffect(() => {
    initializeBoard();
  }, [rows, cols, mines]);

  // Таймер
  useEffect(() => {
    let interval;
    if (isTimerRunning && gameStatus === 'playing') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, gameStatus]);

  // Проверка победы
  useEffect(() => {
    if (gameStatus === 'playing' && revealedCount === rows * cols - mines && revealedCount > 0) {
      setGameStatus('won');
      setIsTimerRunning(false);
    }
  }, [revealedCount, rows, cols, mines, gameStatus]);

  const initializeBoard = () => {
    const newBoard = [];
    for (let row = 0; row < rows; row++) {
      const boardRow = [];
      for (let col = 0; col < cols; col++) {
        boardRow.push({
          row,
          col,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newBoard.push(boardRow);
    }
    
    // Расставляем мины
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Подсчитываем соседние мины
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!newBoard[row][col].isMine) {
          newBoard[row][col].neighborMines = countNeighborMines(newBoard, row, col);
        }
      }
    }

    setBoard(newBoard);
    setGameStatus('playing');
    setMinesLeft(mines);
    setRevealedCount(0);
    setTimer(0);
    setIsTimerRunning(false);
  };

  const countNeighborMines = (board, row, col) => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const newRow = row + i;
        const newCol = col + j;
        if (
          newRow >= 0 &&
          newRow < rows &&
          newCol >= 0 &&
          newCol < cols &&
          board[newRow][newCol].isMine
        ) {
          count++;
        }
      }
    }
    return count;
  };

  const revealCell = (row, col) => {
    if (gameStatus !== 'playing') return;
    
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }

    const newBoard = [...board];
    const cell = newBoard[row][col];

    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    let newRevealedCount = revealedCount + 1;

    if (cell.isMine) {
      setGameStatus('lost');
      setIsTimerRunning(false);
      revealAllMines(newBoard);
    } else if (cell.neighborMines === 0) {
      // Рекурсивно открываем пустые ячейки
      const revealed = revealEmptyCells(newBoard, row, col);
      newRevealedCount = revealedCount + revealed;
    }

    setBoard(newBoard);
    setRevealedCount(newRevealedCount);
  };

  const revealEmptyCells = (board, row, col) => {
    let revealedCount = 0;
    const queue = [[row, col]];
    const visited = new Set();
    visited.add(`${row},${col}`);

    while (queue.length > 0) {
      const [currentRow, currentCol] = queue.shift();
      
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          const newRow = currentRow + i;
          const newCol = currentCol + j;
          const key = `${newRow},${newCol}`;

          if (
            newRow >= 0 &&
            newRow < rows &&
            newCol >= 0 &&
            newCol < cols &&
            !visited.has(key)
          ) {
            visited.add(key);
            const cell = board[newRow][newCol];
            if (!cell.isRevealed && !cell.isFlagged && !cell.isMine) {
              cell.isRevealed = true;
              revealedCount++;
              if (cell.neighborMines === 0) {
                queue.push([newRow, newCol]);
              }
            }
          }
        }
      }
    }

    return revealedCount;
  };

  const revealAllMines = (board) => {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (board[row][col].isMine) {
          board[row][col].isRevealed = true;
        }
      }
    }
  };

  const checkWinByFlags = (board) => {
    let correctFlags = 0;
    let wrongFlags = 0;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = board[row][col];
        if (cell.isFlagged) {
          if (cell.isMine) {
            correctFlags++;
          } else {
            wrongFlags++;
          }
        }
      }
    }
    
    // Победа если все мины отмечены флагами и нет неправильных флагов
    if (correctFlags === mines && wrongFlags === 0) {
      setGameStatus('won');
      setIsTimerRunning(false);
    }
  };

  const toggleFlag = (row, col) => {
    if (gameStatus !== 'playing') return;

    const newBoard = [...board];
    const cell = newBoard[row][col];

    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    setBoard(newBoard);
    setMinesLeft(cell.isFlagged ? minesLeft - 1 : minesLeft + 1);
    
    // Проверяем победу после установки флага
    checkWinByFlags(newBoard);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="board-container">
      <div className="board-header">
        <div className="info-panel">
          <div className="info-item">
            <span className="info-label">Баги:</span>
            <span className="info-value"><img src={bagIcon1} alt="bag" className="bag-icon-1" /> {minesLeft}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Время:</span>
            <span className="info-value"><img src={timeIcon} alt="time" className="time-icon" /> {formatTime(timer)}</span>
          </div>
        </div>
        {gameStatus !== 'playing' && (
          <div 
            className={`game-status ${gameStatus}`}
            onClick={initializeBoard}
            style={{ cursor: 'pointer' }}
          >
            {gameStatus === 'won' ? 'Победа! Начать заново?' : 'Поражение! Начать заново?'}
          </div>
        )}
      </div>
      <div 
        className="board"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              onLeftClick={() => revealCell(rowIndex, colIndex)}
              onRightClick={() => toggleFlag(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Board;

