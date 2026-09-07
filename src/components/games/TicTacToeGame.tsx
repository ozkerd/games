import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameMode } from '../../types';
import { Users, Cpu, Trophy, RotateCcw, LayoutGrid, Sparkles, X, Circle } from 'lucide-react';

interface TicTacToeGameProps {
  player1Name: string;
  player2Name: string;
  onGameOver: (winner: 'player1' | 'player2' | 'draw') => void;
  onBackToHub: () => void;
}

type CellValue = '' | 'X' | 'O';

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6],            // Diagonals
];

export const TicTacToeGame: React.FC<TicTacToeGameProps> = ({
  player1Name,
  player2Name,
  onGameOver,
  onBackToHub,
}) => {
  const [gameMode, setGameMode] = useState<GameMode>('vs_player');
  const [stage, setStage] = useState<'setup' | 'playing' | 'gameover'>('setup');
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(''));
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1); // 1 = X, 2 = O
  const [winner, setWinner] = useState<'player1' | 'player2' | 'draw' | null>(null);
  const [winningCombo, setWinningCombo] = useState<number[]>([]);

  const effectiveP2Name = gameMode === 'vs_ai' ? 'TicTac AI 🤖' : player2Name;

  // Check win or draw
  const checkWin = useCallback((b: CellValue[]): { winner: 'X' | 'O' | 'draw' | null; combo: number[] } => {
    for (const combo of WINNING_COMBOS) {
      const [a, c, d] = combo;
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return { winner: b[a] as 'X' | 'O', combo };
      }
    }
    if (b.every((cell) => cell !== '')) {
      return { winner: 'draw', combo: [] };
    }
    return { winner: null, combo: [] };
  }, []);

  const handleStartGame = () => {
    setBoard(Array(9).fill(''));
    setCurrentTurn(1);
    setWinner(null);
    setWinningCombo([]);
    setStage('playing');
  };

  const handleClickCell = useCallback((index: number) => {
    if (stage !== 'playing') return;
    if (board[index] !== '') return;

    const newBoard = [...board];
    newBoard[index] = currentTurn === 1 ? 'X' : 'O';
    setBoard(newBoard);

    const result = checkWin(newBoard);
    if (result.winner) {
      if (result.winner === 'draw') {
        setWinner('draw');
        setStage('gameover');
        onGameOver('draw');
      } else {
        const winPlayer = result.winner === 'X' ? 'player1' : 'player2';
        setWinner(winPlayer);
        setWinningCombo(result.combo);
        setStage('gameover');
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        onGameOver(winPlayer);
      }
    } else {
      setCurrentTurn((prev) => (prev === 1 ? 2 : 1));
    }
  }, [board, currentTurn, stage, checkWin, onGameOver]);

  // Minimax AI for 1 Player vs AI mode
  const minimax = useCallback((b: CellValue[], depth: number, isMaximizing: boolean): number => {
    const result = checkWin(b);
    if (result.winner === 'O') return 10 - depth;
    if (result.winner === 'X') return depth - 10;
    if (result.winner === 'draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i] === '') {
          b[i] = 'O';
          const score = minimax(b, depth + 1, false);
          b[i] = '';
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i] === '') {
          b[i] = 'X';
          const score = minimax(b, depth + 1, true);
          b[i] = '';
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }, [checkWin]);

  // AI Move Effect
  useEffect(() => {
    if (stage === 'playing' && gameMode === 'vs_ai' && currentTurn === 2) {
      let bestScore = -Infinity;
      let bestMove = -1;

      const tempBoard = [...board];
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === '') {
          tempBoard[i] = 'O';
          const score = minimax(tempBoard, 0, false);
          tempBoard[i] = '';
          if (score > bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }

      if (bestMove !== -1) {
        const timer = setTimeout(() => {
          handleClickCell(bestMove);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [stage, gameMode, currentTurn, board, minimax, handleClickCell]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* SETUP STAGE */}
      {stage === 'setup' && (
        <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl">
              <X className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                Tic-Tac-Toe Arcade
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
                    ? 'bg-cyan-600/20 border-cyan-500 text-white ring-1 ring-cyan-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-cyan-400" />
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
                <p className="text-xs text-slate-400">Challenge Minimax AI</p>
              </button>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-600 to-indigo-600 text-white font-display font-bold text-lg hover:from-cyan-600 hover:to-indigo-700 shadow-xl shadow-cyan-600/25 transition-all"
          >
            Start Tic-Tac-Toe Match
          </button>
        </div>
      )}

      {/* PLAYING / GAMEOVER ARENA */}
      {(stage === 'playing' || stage === 'gameover') && (
        <div className="space-y-6">
          {/* Header Turn Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
                <X className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-base">Tic-Tac-Toe (X - O)</h3>
                <p className="text-xs text-slate-400">Get 3 markers in a line to win!</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Turn:
              </span>
              <span className={`font-display text-sm font-extrabold px-3 py-1 rounded-lg ${
                currentTurn === 1
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/40 animate-pulse'
                  : 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 animate-pulse'
              }`}>
                {currentTurn === 1 ? `${player1Name} (X)` : `${effectiveP2Name} (O)`}
              </span>
            </div>
          </div>

          {/* 3x3 GRID */}
          <div className="max-w-md mx-auto p-4 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
            <div className="grid grid-cols-3 gap-3">
              {board.map((val, idx) => {
                const isWinnerCombo = winningCombo.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleClickCell(idx)}
                    disabled={val !== '' || stage !== 'playing' || (gameMode === 'vs_ai' && currentTurn === 2)}
                    className={`h-24 sm:h-28 rounded-2xl font-display text-4xl sm:text-5xl font-extrabold flex items-center justify-center transition-all duration-200 border-2 ${
                      val === 'X'
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/20'
                        : val === 'O'
                        ? 'bg-purple-950/40 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/20'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                    } ${isWinnerCombo ? 'ring-4 ring-emerald-400 bg-emerald-950/40 animate-pulse' : ''}`}
                  >
                    {val === 'X' ? (
                      <X className="w-12 h-12 stroke-[3]" />
                    ) : val === 'O' ? (
                      <Circle className="w-10 h-10 stroke-[3]" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* GAMEOVER MODAL */}
      {stage === 'gameover' && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg animate-fadeIn">
          <div className="w-full max-w-lg p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center text-cyan-400 glow-emerald animate-bounce">
                <Trophy className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                Tic-Tac-Toe Match Result
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
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-600 to-indigo-600 text-white font-display font-bold text-base hover:from-cyan-600 hover:to-indigo-700 shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Play Next Tic-Tac-Toe Match
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
