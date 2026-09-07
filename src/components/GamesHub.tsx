import React, { useState } from 'react';
import { Gamepad2, Users, Sparkles, Trophy, Lock, Play, Flame, Brain, ShieldCheck } from 'lucide-react';

interface GamesHubProps {
  onSelectGame: (gameId: string) => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({ onSelectGame }) => {
  const [filter, setFilter] = useState<'all' | 'multiplayer' | 'word'>('all');

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-slate-900 border border-indigo-500/20 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Arcade Games Portal
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Play Instant Web Games Together 🎮
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Welcome to <strong className="text-white">games.primerllm.com</strong>! Compete locally with friends on the same keyboard or test your skills against the computer.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Games' },
            { id: 'multiplayer', label: '2-Player Same Keyboard' },
            { id: 'word', label: 'Word & Puzzle' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-mono">
          1 Active Game • 3 Upcoming
        </span>
      </div>

      {/* Games Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Game 1: Dual Hangman (Active!) */}
        {(filter === 'all' || filter === 'multiplayer' || filter === 'word') && (
          <div className="group relative bg-slate-900/90 border-2 border-indigo-500/40 hover:border-indigo-500 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 flex flex-col justify-between">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-current" /> Live & Ready
            </div>

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  2-Player Battle vs Computer
                </span>
                <h3 className="font-display text-2xl font-bold text-white mt-1">
                  Dual Hangman
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Two players battle on side-by-side hangman boards to decode the computer's secret word on the same keyboard!
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <Users className="w-3 h-3 text-indigo-400" /> 2 Players
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <Brain className="w-3 h-3 text-purple-400" /> English Vocabulary
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Side-by-Side
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800">
              <button
                onClick={() => onSelectGame('game_hangman')}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-display font-bold text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                Play Dual Battle Now
              </button>
            </div>
          </div>
        )}

        {/* Game 2: Connect 4 / Tic-Tac-Toe (Coming Soon Placeholder) */}
        <div className="relative bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 opacity-75 flex flex-col justify-between">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" /> Coming Soon
          </div>

          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                2-Player Strategy
              </span>
              <h3 className="font-display text-2xl font-bold text-slate-300 mt-1">
                Connect Four
              </h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Classic 2-player grid strategy game. Connect four tokens in a row vertically, horizontally, or diagonally.
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/60">
            <button
              disabled
              className="w-full py-3.5 px-4 rounded-xl bg-slate-800/60 text-slate-500 font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Next Release
            </button>
          </div>
        </div>

        {/* Game 3: Memory Match (Coming Soon Placeholder) */}
        <div className="relative bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 opacity-75 flex flex-col justify-between">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" /> Coming Soon
          </div>

          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center">
              <Brain className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Memory Puzzle
              </span>
              <h3 className="font-display text-2xl font-bold text-slate-300 mt-1">
                Memory Card Duel
              </h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Flip cards, match pairs, and test your memory against a friend on the same screen!
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/60">
            <button
              disabled
              className="w-full py-3.5 px-4 rounded-xl bg-slate-800/60 text-slate-500 font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Next Release
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
