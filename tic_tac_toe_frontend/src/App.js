import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Get winning combinations for a standard 3x3 Tic Tac Toe grid.
 */
const WINNING_LINES = [
  [0,1,2], [3,4,5], [6,7,8], // rows
  [0,3,6], [1,4,7], [2,5,8], // columns
  [0,4,8], [2,4,6]           // diagonals
];

// PUBLIC_INTERFACE
function App() {
  // Main state: game board cells, X's turn, win/tie, scores, and current theme.
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null); // 'X', 'O', or 'tie'
  const [scores, setScores] = useState({ X: 0, O: 0, tie: 0 });
  const [theme, setTheme] = useState('light');

  // Update document theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Detect win/tie and update state accordingly.
  useEffect(() => {
    const detectedWinner = calculateWinner(board);
    if (detectedWinner) {
      setWinner(detectedWinner);
      setScores(prev => {
        if (detectedWinner === 'tie') {
          return { ...prev, tie: prev.tie + 1 };
        }
        return { ...prev, [detectedWinner]: prev[detectedWinner] + 1 };
      });
    }
  // Only check winner if the board changes and if game not already won
  // Winner state managed locally so as not to increment scores repeatedly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  // PUBLIC_INTERFACE
  function toggleTheme() {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }
  // PUBLIC_INTERFACE
  function handleSquareClick(idx) {
    // Do not allow moves if already won or cell occupied
    if (winner || board[idx]) return;
    const nextBoard = board.slice();
    nextBoard[idx] = xIsNext ? 'X' : 'O';
    setBoard(nextBoard);
    setXIsNext(!xIsNext);
  }
  // PUBLIC_INTERFACE
  function handleRestart() {
    setBoard(Array(9).fill(null));
    setXIsNext(winner === 'O'); // winner starts second next time
    setWinner(null);
  }

  const status = winner
    ? (winner === 'tie' ? "It's a tie!" : `Winner: ${winner}`)
    : `Turn: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="App">
      <header className="App-header" style={{ minHeight: '100vh', justifyContent: 'flex-start' }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <h1 className="ttt-title" style={{ marginTop: 32, color: 'var(--text-primary)' }}>
          Tic Tac Toe
        </h1>
        <div className="ttt-scoreboard" style={{
            margin: '24px 0 16px 0',
            display: 'flex',
            gap: 24,
            justifyContent: 'center'
        }}>
          <ScoreCard label="X" value={scores.X} primary />
          <ScoreCard label="Tie" value={scores.tie} accent />
          <ScoreCard label="O" value={scores.O} primary={false} />
        </div>
        <div className="ttt-status" style={{
          minHeight: 28,
          fontSize: 20,
          color: winner
            ? (winner === 'tie' ? 'var(--text-secondary)' : 'var(--accent, #ff9800)')
            : 'var(--text-primary)',
          marginBottom: 16,
          fontWeight: 700,
          textAlign: 'center'
        }}>
          {status}
        </div>
        <GameGrid
          board={board}
          onSquareClick={handleSquareClick}
          winner={winner}
        />
        <button
          className="ttt-restart-btn"
          onClick={handleRestart}
          style={{
            marginTop: 28,
            marginBottom: 8,
            fontWeight: 600,
            background: 'var(--button-bg, #1976d2)',
            color: 'var(--button-text, #fff)',
            border: 'none',
            borderRadius: 8,
            padding: '10px 30px',
            fontSize: 18,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          Restart Game
        </button>
      </header>
    </div>
  );
}

/**
 * Checks the board and returns 'X', 'O', or 'tie' if there is a winner/tie.
 * @param {Array<string|null>} squares 
 * @returns {('X'|'O'|'tie'|null)}
 */
function calculateWinner(squares) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]) {
      return squares[a];
    }
  }
  // Check for tie (all filled & no winner)
  if (squares.every(s => s)) return 'tie';
  return null;
}

/**
 * Game grid component: renders a 3x3 board.
 */
function GameGrid({ board, onSquareClick, winner }) {
  return (
    <div className="ttt-grid-container">
      <div className="ttt-grid">
        {board.map((value, idx) => (
          <button
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            className="ttt-cell"
            onClick={() => onSquareClick(idx)}
            disabled={!!board[idx] || !!winner}
            aria-label={
              board[idx]
                ? `Cell occupied by ${board[idx]}`
                : (winner ? 'Game over' : 'Place move')
            }
            tabIndex={0}
            style={{
              color:
                value === 'X'
                  ? 'var(--primary, #1976d2)'
                  : value === 'O'
                  ? 'var(--accent, #ff9800)'
                  : undefined,
              background: 'var(--bg-secondary)',
              border:
                winner && (value && isCellInWinLine(board, idx))
                  ? '2.5px solid var(--accent, #ff9800)'
                  : '1.5px solid var(--border-color)',
            }}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}

// Returns true if the given cell is part of win line; for styling effect.
// Helper for GameGrid.
function isCellInWinLine(board, idx) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (
      (idx === a || idx === b || idx === c) &&
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Score display pill.
 */
function ScoreCard({ label, value, accent, primary }) {
  let bg, color;
  if (accent) {
    bg = 'var(--accent, #ff9800)';
    color = '#fff';
  } else if (primary) {
    bg = 'var(--primary, #1976d2)';
    color = '#fff';
  } else {
    bg = 'var(--secondary, #e3e3e3)';
    color = '#1a1a1a';
  }
  return (
    <span
      className="ttt-score-pill"
      style={{
        display: 'inline-block',
        minWidth: 60,
        padding: '8px 22px',
        borderRadius: 18,
        fontSize: 18,
        background: bg,
        color,
        fontWeight: 700,
        letterSpacing: 1.2,
        boxShadow:
          '0 0.5px 3px 0 rgba(0,0,0,0.07), 0 2px 4.5px 0 rgba(0,0,0,0.06)',
      }}
    >
      {label}: {value}
    </span>
  );
}

export default App;
