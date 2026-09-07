import React from 'react';
import { Gamepad2, Users, Cloud, RotateCcw } from 'lucide-react';
import { PlayerScore } from '../types';

interface NavbarProps {
  score: PlayerScore;
  player1Name: string;
  player2Name: string;
  activeGuesser: 1 | 2;
  onResetScores: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  score,
  player1Name,
  player2Name,
  activeGuesser,
  onResetScores,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Domain info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-white tracking-wide">
                games.primerllm.com
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Cloud className="w-3 h-3" /> Cloudflare Pages
              </span>
            </div>
            <p className="text-xs text-slate-400">2-Player Same-Keyboard Hangman</p>
          </div>
        </div>

        {/* Score Board & Local Player Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl p-1.5 px-3">
            <Users className="w-4 h-4 text-indigo-400" />
            <div className="flex items-center gap-3 text-sm">
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-all ${
                activeGuesser === 2 ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/40' : 'text-slate-400'
              }`}>
                <span>{player1Name} (Setter):</span>
                <span className="font-mono text-white font-bold">{score.player1}</span>
              </div>
              <span className="text-slate-600 font-bold">:</span>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-all ${
                activeGuesser === 1 ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/40' : 'text-slate-400'
              }`}>
                <span>{player2Name} (Guesser):</span>
                <span className="font-mono text-white font-bold">{score.player2}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onResetScores}
            title="Reset Scores"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
