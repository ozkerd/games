import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight, RotateCcw, LayoutGrid, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  winner: 'player1' | 'player2';
  player1Name: string;
  player2Name: string;
  secretWord: string;
  p1Mistakes: number;
  p2Mistakes: number;
  onPlayAgain: () => void;
  onBackToHub: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  player1Name,
  player2Name,
  secretWord,
  p1Mistakes,
  p2Mistakes,
  onPlayAgain,
  onBackToHub,
}) => {
  const winnerName = winner === 'player1' ? player1Name : player2Name;

  useEffect(() => {
    // Trigger festive confetti burst on win
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg animate-fadeIn">
      <div className="w-full max-w-lg p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center space-y-6 transform transition-all scale-100">
        {/* Banner Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 glow-emerald animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" /> Battle Winner Declared!
          </span>
          <h2 className="font-display text-3xl font-extrabold text-white">
            {winnerName} Wins! 🎉
          </h2>
          <p className="text-sm text-slate-400">
            {winnerName} successfully cracked the computer's secret word first!
          </p>
        </div>

        {/* Revealed Secret Word */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Computer's Secret Word Was:
          </span>
          <div className="font-mono text-2xl font-bold tracking-widest text-indigo-300 uppercase">
            {secretWord}
          </div>
        </div>

        {/* Comparison Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="block text-slate-400 font-semibold mb-0.5">{player1Name} Mistakes</span>
            <span className="font-mono font-bold text-indigo-400 text-base">{p1Mistakes} Wrong</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="block text-slate-400 font-semibold mb-0.5">{player2Name} Mistakes</span>
            <span className="font-mono font-bold text-purple-400 text-base">{p2Mistakes} Wrong</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white font-display font-bold text-base hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <RotateCcw className="w-5 h-5" />
            Play Next Match (New Secret Word)
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onBackToHub}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm border border-slate-700/60 flex items-center justify-center gap-2 transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            Return to Games Hub
          </button>
        </div>
      </div>
    </div>
  );
};
