import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameMode } from '../../types';
import { Users, Cpu, Trophy, RotateCcw, LayoutGrid, Sparkles, Circle } from 'lucide-react';

interface Connect4GameProps {
  player1Name: string;
  player2Name: string;
  onGameOver: (winner: 'player1' | 'player2' | 'draw') => void;
  onBackToHub: () => void;
}

const ROWS = 6;
const COLS = 7;
type CellValue = 0 | 1 | 2; // 0: empty, 1: Player 1, 2: Player 2 (or AI)

export const Connect4Game: React.FC<Connect4GameProps> = ({
  player1Name,
  player2Name,
  onGameOver,
  onBackToHub,
}) => {
  const [gameMode, setGameMode] = useState<GameMode>('vs_player');
  const [stage, setStage] = useState<'setup' | 'playing' | 'gameover'>('setup');
  const [board, setBoard] = useState<CellValue[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(0))
  );
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [winner, setWinner] = useState<'player1' | 'player2' | 'draw' | null>(null);
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  const effectiveP2Name = gameMode === 'vs_ai' ? 'Computer AI 🤖' : player2Name;

  // Check for 4 in a row
  const checkWin = useCallback((currentBoard: CellValue[][]): { winner: 1 | 2 | null; cells: [number, number][] } => {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const val = currentBoard[r][c];
        if (val !== 0 && val === currentBoard[r][c + 1] && val === currentBoard[r][c + 2] && val === currentBoard[r][c + 3]) {
          return { winner: val, cells: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]] };
        }
      }
    }
    // Vertical
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c < COLS; c++) {
        const val = currentBoard[r][c];
        if (val !== 0 && val === currentBoard[r + 1][c] && val === currentBoard[r + 2][c] && val === currentBoard[r + 3][c]) {
          return { winner: val, cells: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]] };
        }
      }
    }
    // Diagonal (down-right)
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const val = currentBoard[r][c];
        if (val !== 0 && val === currentBoard[r + 1][c + 1] && val === currentBoard[r + 2][c + 2] && val === currentBoard[r + 3][c + 3]) {
          return { winner: val, cells: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]] };
        }
      }
    }
    // Diagonal (up-right)
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const val = currentBoard[r][c];
        if (val !== 0 && val === currentBoard[r - 1][c + 1] && val === currentBoard[r - 2][c + 2] && val === currentBoard[r - 3][c + 3]) {
          return { winner: val, cells: [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]] };
        }
      }
    }
    return { winner: null, cells: [] };
  }, []);

  const handleStartGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
    setCurrentTurn(1);
    setWinner(null);
    setWinningCells([]);
    setStage('playing');
  };

  const dropToken = useCallback((col: number) => {
    if (stage !== 'playing') return;

    // Find lowest open row in selected column
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === 0) {
        targetRow = r;
        break;
      }
    }

    if (targetRow === -1) return; // Column full

    const newBoard = board.map((row) => [...row]);
    newBoard[targetRow][col] = currentTurn;
    setBoard(newBoard);

    // Check win
    const result = checkWin(newBoard);
    if (result.winner) {
      const winPlayer = result.winner === 1 ? 'player1' : 'player2';
      setWinner(winPlayer);
      setWinningCells(result.cells);
      setStage('gameover');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      onGameOver(winPlayer);
    } else if (newBoard.every((row) => row.every((cell) => cell !== 0))) {
      setWinner('draw');
      setStage('gameover');
      onGameOver('draw');
    } else {
      setCurrentTurn((prev) => (prev === 1 ? 2 : 1));
    }
  }, [board, currentTurn, stage, checkWin, onGameOver]);

  // AI Move logic
  useEffect(() => {
    if (stage === 'playing' && gameMode === 'vs_ai' && currentTurn === 2) {
      const getValidCols = (b: CellValue[][]) => {
        const cols: number[] = [];
        for (let c = 0; c < COLS; c++) {
          if (b[0][c] === 0) cols.push(c);
        }
        return cols;
      };

      const validCols = getValidCols(board);
      if (validCols.length === 0) return;

      // 1. Can AI win immediately?
      let bestCol = -1;
      for (const col of validCols) {
        let r = -1;
        for (let row = ROWS - 1; row >= 0; row--) {
          if (board[row][col] === 0) { r = row; break; }
        }
        const tempBoard = board.map((row) => [...row]);
        tempBoard[r][col] = 2;
        if (checkWin(tempBoard).winner === 2) {
          bestCol = col;
          break;
        }
      }

      // 2. Must AI block Player 1 from winning?
      if (bestCol === -1) {
        for (const col of validCols) {
          let r = -1;
          for (let row = ROWS - 1; row >= 0; row--) {
            if (board[row][col] === 0) { r = row; break; }
          }
          const tempBoard = board.map((row) => [...row]);
          tempBoard[r][col] = 1;
          if (checkWin(tempBoard).winner === 1) {
            bestCol = col;
            break;
          }
        }
      }

      // 3. Prefer center columns (3, 2, 4)
      if (bestCol === -1) {
        const centerOrder = [3, 2, 4, 1, 5, 0, 6];
        bestCol = centerOrder.find((c) => validCols.includes(c)) ?? validCols[0];
      }

      const timer = setTimeout(() => {
        dropToken(bestCol);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [stage, gameMode, currentTurn, board, checkWin, dropToken]);

  const isWinningCell = (r: number, c: number) => {
    return winningCells.some(([wr, wc]) => wr === r && wc === c);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* SETUP STAGE */}
      {stage === 'setup' && (
        <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
              <Circle className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
                Connect Four Arcade
              </span>
              <h2 className="font-display text-2xl font-bold text-white">
                Match Setup
              </h2>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Game Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGameMode('vs_player')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  gameMode === 'vs_player'
                    ? 'bg-amber-600/20 border-amber-500 text-white ring-1 ring-amber-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-sm">2 Players</span>
                </div>
                <p className="text-xs text-slate-400">Share same screen with a friend</p>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('vs_ai')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  gameMode === 'vs_ai'
                    ? 'bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  <span className="font-bold text-sm">1 Player vs AI</span>
                </div>
                <p className="text-xs text-slate-400">Play against Connect 4 AI</p>
              </button>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 text-white font-display font-bold text-lg hover:from-amber-600 hover:to-rose-700 shadow-xl shadow-amber-600/25 transition-all"
          >
            Start Connect 4 Match
          </button>
        </div>
      )}

      {/* PLAYING / GAMEOVER ARENA */}
      {(stage === 'playing' || stage === 'gameover') && (
        <div className="space-y-6">
          {/* Header Turn Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                <Circle className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-base">Connect 4 Grid</h3>
                <p className="text-xs text-slate-400">First to connect 4 discs in a line wins!</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Turn:
              </span>
              <span className={`font-display text-sm font-extrabold px-3 py-1 rounded-lg ${
                currentTurn === 1
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse'
                  : 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40 animate-pulse'
              }`}>
                {currentTurn === 1 ? `${player1Name} (Red)` : `${effectiveP2Name} (Yellow)`}
              </span>
            </div>
          </div>

          {/* 7x6 BOARD GRID */}
          <div className="max-w-xl mx-auto p-4 bg-indigo-950/80 border-4 border-indigo-600 rounded-3xl shadow-2xl shadow-indigo-900/50">
            {/* Hover Column Arrows */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {Array(COLS).fill(0).map((_, colIdx) => (
                <button
                  key={colIdx}
                  onClick={() => dropToken(colIdx)}
                  onMouseEnter={() => setHoverCol(colIdx)}
                  onMouseLeave={() => setHoverCol(null)}
                  disabled={stage !== 'playing' || (gameMode === 'vs_ai' && currentTurn === 2)}
                  className={`h-8 rounded-lg flex items-center justify-center transition-all ${
                    hoverCol === colIdx && stage === 'playing'
                      ? currentTurn === 1 ? 'bg-rose-500/30 text-rose-400' : 'bg-amber-500/30 text-amber-400'
                      : 'opacity-0 hover:opacity-100'
                  }`}
                >
                  ▼
                </button>
              ))}
            </div>

            {/* Grid Cells */}
            <div className="grid grid-cols-7 gap-2 bg-indigo-900 p-3 rounded-2xl">
              {board.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const isWinCell = isWinningCell(rIdx, cIdx);
                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => dropToken(cIdx)}
                      disabled={stage !== 'playing' || (gameMode === 'vs_ai' && currentTurn === 2)}
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
                        cell === 1
                          ? 'bg-gradient-to-tr from-rose-600 to-rose-400 border-rose-300 shadow-lg shadow-rose-600/50'
                          : cell === 2
                          ? 'bg-gradient-to-tr from-amber-500 to-amber-300 border-amber-200 shadow-lg shadow-amber-500/50'
                          : 'bg-slate-950 border-indigo-950/80 hover:bg-slate-900'
                      } ${isWinCell ? 'ring-4 ring-white animate-bounce' : ''}`}
                    >
                      {isWinCell && <Trophy className="w-6 h-6 text-white drop-shadow-md" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* GAMEOVER MODAL */}
      {stage === 'gameover' && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg animate-fadeIn">
          <div className="w-full max-w-lg p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 glow-emerald animate-bounce">
                <Trophy className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                Connect Four Winner!
              </span>
              <h2 className="font-display text-3xl font-extrabold text-white">
                {winner === 'draw'
                  ? "It's a Draw! 🤝"
                  : `${winner === 'player1' ? player1Name : effectiveP2Name} Wins! 🎉`}
              </h2>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleStartGame}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 text-white font-display font-bold text-base hover:from-amber-600 hover:to-rose-700 shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Play Next Connect 4 Match
              </button>

              <button
                onClick={onBackToHub}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                Return to Games Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
