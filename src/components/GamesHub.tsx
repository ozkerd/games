import React, { useState } from 'react';
import { Gamepad2, Users, Sparkles, Trophy, Play, Flame, Brain, ShieldCheck, Circle, X } from 'lucide-react';
import { ActiveView } from '../types';

interface GamesHubProps {
  onSelectGame: (gameId: ActiveView) => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({ onSelectGame }) => {
  const [filter, setFilter] = useState<'all' | 'multiplayer' | 'puzzle'>('all');

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
            Welcome to <strong className="text-white">games.primerllm.com</strong>! Play solo against smart AI opponents or compete with friends on the same keyboard.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All 4 Games' },
            { id: 'multiplayer', label: '1 & 2 Players' },
            { id: 'puzzle', label: 'Strategy & Puzzle' },
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
        <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 font-bold">
          <Flame className="w-4 h-4 fill-current" /> 5 Live Games Active
        </span>
      </div>

      {/* Games Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Game 0: OKEY & 101 OKEY (FEATURED NEW) */}
        <div className="group relative bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/60 hover:border-amber-400 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/25 flex flex-col justify-between md:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-amber-600/30 group-hover:scale-110 transition-transform">
                🀄
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider animate-pulse">
                  🔥 YENİ: DÜZ OKEY & 101
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Geleneksel Türk Masa Oyunu • 2 & 4 Kişilik • Online & AI
              </span>
              <h3 className="font-display text-3xl font-extrabold text-white mt-1">
                Okey & 101 Okey (Yüzbir)
              </h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-3xl">
                Gerçekçi ahşap ıstaka ve 3D fildişi melamin taşlarla Düz Okey ve 101 Okey keyfi! Akıllı yapay zeka botlarına karşı hemen oynayın veya arkadaşınıza oda linki göndererek online katılmasını sağlayın.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-200 font-semibold">
                🀄 Düz Okey & 101 Okey
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <Users className="w-3.5 h-3.5 text-amber-400" /> 2 & 4 Kişilik Masa
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <Brain className="w-3.5 h-3.5 text-purple-400" /> Akıllı AI Botlar
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Online Link ile Katılım
              </span>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/80">
            <button
              onClick={() => onSelectGame('game_okey')}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-display font-extrabold text-lg shadow-xl shadow-amber-600/30 flex items-center justify-center gap-3 group-hover:gap-4 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              Okey Oyna (Düz & 101)
            </button>
          </div>
        </div>
        {/* Game 1: Dual Hangman */}
        <div className="group relative bg-slate-900/90 border-2 border-indigo-500/40 hover:border-indigo-500 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Word Battle • 1 & 2 Players
              </span>
              <h3 className="font-display text-2xl font-bold text-white mt-1">
                Dual Hangman
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Decode secret words on side-by-side hangman boards against Computer AI or a friend!
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <Users className="w-3 h-3 text-indigo-400" /> 1 & 2 Players
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <Brain className="w-3 h-3 text-purple-400" /> Word Dictionary
              </span>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800">
            <button
              onClick={() => onSelectGame('game_hangman')}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-display font-bold text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Play Dual Hangman
            </button>
          </div>
        </div>

        {/* Game 2: Connect 4 */}
        <div className="group relative bg-slate-900/90 border-2 border-amber-500/40 hover:border-amber-500 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Circle className="w-7 h-7 fill-current" />
            </div>

            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Grid Strategy • 1 & 2 Players
              </span>
              <h3 className="font-display text-2xl font-bold text-white mt-1">
                Connect Four
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                7x6 gravity grid game. Connect 4 discs vertically, horizontally, or diagonally!
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <Users className="w-3 h-3 text-amber-400" /> 1 & 2 Players
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Gravity Drops
              </span>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800">
            <button
              onClick={() => onSelectGame('game_connect4')}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-display font-bold text-base shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Play Connect Four
            </button>
          </div>
        </div>

        {/* Game 3: Memory Card Duel */}
        <div className="group relative bg-slate-900/90 border-2 border-purple-500/40 hover:border-purple-500 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Memory Puzzle • 1 & 2 Players
              </span>
              <h3 className="font-display text-2xl font-bold text-white mt-1">
                Memory Card Duel
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Flip cards, match emoji pairs, and test your memory against a friend or smart AI!
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <Users className="w-3 h-3 text-purple-400" /> 1 & 2 Players
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <Trophy className="w-3 h-3 text-amber-400" /> 16 / 24 Cards
              </span>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800">
            <button
              onClick={() => onSelectGame('game_memory')}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-display font-bold text-base shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Play Memory Card Duel
            </button>
          </div>
        </div>

        {/* Game 4: Tic-Tac-Toe */}
        <div className="group relative bg-slate-900/90 border-2 border-cyan-500/40 hover:border-cyan-500 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <X className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Classic Arcade • 1 & 2 Players
              </span>
              <h3 className="font-display text-2xl font-bold text-white mt-1">
                Tic-Tac-Toe
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Classic 3x3 grid battle (X vs O). Play locally or challenge Minimax AI!
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <Users className="w-3 h-3 text-cyan-400" /> 1 & 2 Players
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <Brain className="w-3 h-3 text-purple-400" /> Minimax AI
              </span>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800">
            <button
              onClick={() => onSelectGame('game_tictactoe')}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-display font-bold text-base shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Play Tic-Tac-Toe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
