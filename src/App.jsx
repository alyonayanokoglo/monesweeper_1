import React, { useState } from 'react';
import Board from './components/Board';
import pointsIcon from './img/points.svg';

const DIFFICULTY_LEVELS = {
  easy: {
    name: 'junior',
    rows: 9,
    cols: 17,
    mines: 15,
  },
  medium: {
    name: 'middle',
    rows: 13,
    cols: 24,
    mines: 50,
  },
  hard: {
    name: 'senior',
    rows: 16,
    cols: 30,
    mines: 99,
  },
};

function App() {
  const [difficulty, setDifficulty] = useState('easy');
  const [gameKey, setGameKey] = useState(0);

  const changeLevel = (level) => {
    setDifficulty(level);
    setGameKey((prev) => prev + 1);
  };

  const currentLevel = DIFFICULTY_LEVELS[difficulty];

  return (
    <div className="app">
      <main className="app-main">
        <div className="game-controls">
          <div className="difficulty-selector">
            {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
              <button
                key={key}
                className={`difficulty-tab ${difficulty === key ? 'active' : ''}`}
                onClick={() => changeLevel(key)}
              >
                <span className="difficulty-name">{level.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="game-container">
          <div className="game-header">
            <h2 className="game-title">minesweeper.exe</h2>
            <div className="game-logo">
              <img src={pointsIcon} alt="points" />
            </div>
          </div>
          <Board
            key={gameKey}
            rows={currentLevel.rows}
            cols={currentLevel.cols}
            mines={currentLevel.mines}
          />
        </div>
      </main>
    </div>
  );
}

export default App;

