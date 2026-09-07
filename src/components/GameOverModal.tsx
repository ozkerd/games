import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Skull, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  winner: 'player1' | 'player2';
  player1Name: string;
  player2Name: string;
  secretWord: string;
  wrongGuessesCount: number;
  totalGuessesCount: number;
  onNextRoundSwap: () => void;
  onPlayAgainSame: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  player1Name,
  player2Name,
  secretWord,
  wrongGuessesCount,
  totalGuessesCount,
  onNextRoundSwap,
  onPlayAgainSame,
}) => {
  const isPlayer2Won = winner === 'player2';
  const winnerName = isPlayer2Won ? player2Name : player1Name;

  useEffect(() => {
    if (isPlayer2Won) {
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
    }
  }, [isPlayer2Won]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg animate-fadeIn">
      <div className="w-full max-w-lg p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center space-y-6 transform transition-all scale-100">
        {/* Banner / Header Icon */}
        <div className="flex justify-center">
          {isPlayer2Won ? (
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 glow-emerald animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-400 glow-rose">
              <Skull className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {isPlayer2Won ? 'Word Guessed!' : 'Out of Guesses!'}
          </span>
          <h2 className="font-display text-3xl font-extrabold text-white">
            {winnerName} Wins! 🎉
          </h2>
          <p className="text-sm text-slate-400">
            {isPlayer2Won
              ? `${player2Name} successfully decoded the secret word!`
              : `${player1Name}'s secret word stumped ${player2Name}!`}
          </p>
        </div>

        {/* Revealed Secret Word */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            The Secret Word Was:
          </span>
          <div className="font-mono text-2xl font-bold tracking-widest text-indigo-300 uppercase">
            {secretWord}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="block text-slate-500 mb-0.5">Incorrect Guesses</span>
            <span className="font-mono font-bold text-slate-200 text-base">{wrongGuessesCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="block text-slate-500 mb-0.5">Total Letters Guessed</span>
            <span className="font-mono font-bold text-slate-200 text-base">{totalGuessesCount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onNextRoundSwap}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white font-display font-bold text-base hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <Sparkles className="w-5 h-5" />
            Next Round (Swap Roles: {player2Name} Sets Word)
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onPlayAgainSame}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm border border-slate-700/60 flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Keep Same Roles ({player1Name} Sets Again)
          </button>
        </div>
      </div>
    </div>
  );
};
