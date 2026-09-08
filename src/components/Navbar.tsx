import React from 'react';
import { Gamepad2, LayoutGrid, RotateCcw } from 'lucide-react';
import { PlayerScore, ActiveView } from '../types';

interface NavbarProps {
  activeView: ActiveView;
  score: PlayerScore;
  player1Name: string;
  player2Name: string;
  onNavigate: (view: ActiveView) => void;
  onResetScores: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  score,
  player1Name,
  player2Name,
  onNavigate,
  onResetScores,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Hub Link */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('hub')}
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display font-extrabold text-2xl text-white tracking-wide group-hover:text-indigo-300 transition-colors">
                Games
              </span>
              <p className="text-xs text-slate-400">Arcade & Board Games Portal</p>
            </div>
          </button>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-3 sm:gap-4">
          {activeView !== 'hub' && (
            <button
              onClick={() => onNavigate('hub')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
            >
              <LayoutGrid className="w-4 h-4 text-indigo-400" />
              Games Hub
            </button>
          )}

          {/* Scoreboard Tracker */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl p-1.5 px-3">
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
                <span>{player1Name}:</span>
                <span className="font-mono text-white font-bold">{score.player1}</span>
              </div>
              <span className="text-slate-600 font-bold">:</span>
              <div className="flex items-center gap-1.5 font-semibold text-purple-300">
                <span>{player2Name}:</span>
                <span className="font-mono text-white font-bold">{score.player2}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onResetScores}
            title="Reset Scoreboard"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
