import React from 'react';
import { Dices } from 'lucide-react';
import { PlayerColor } from '../../games/tavla/types';

interface TavlaDiceProps {
  dice: [number, number];
  remainingMoves: number[];
  isRolling: boolean;
  rollCallout: string;
  currentTurn: PlayerColor;
  canRoll: boolean;
  onRoll: () => void;
  compact?: boolean;
}

// 6 standard dice pip configurations (0-8 in 3x3 grid)
const DICE_PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export const DieFace: React.FC<{
  value: number;
  isRolling: boolean;
  isUsed?: boolean;
  size?: 'md' | 'lg';
}> = ({ value, isRolling, isUsed = false, size = 'lg' }) => {
  const pips = DICE_PIPS[value] || [];

  const sizeClasses = size === 'lg'
    ? 'w-14 h-14 sm:w-16 sm:h-16'
    : 'w-11 h-11 sm:w-12 sm:h-12';

  const pipSize = size === 'lg'
    ? 'w-2.5 h-2.5 sm:w-3 sm:h-3'
    : 'w-2 h-2 sm:w-2.5 sm:h-2.5';

  return (
    <div className="relative group select-none">
      {/* 3D Dice Cast Shadow */}
      <div
        className={`absolute -bottom-2.5 left-1 right-1 h-3 rounded-full bg-black/70 blur-sm transition-all duration-300 ${
          isRolling ? 'scale-75 opacity-30 translate-y-3' : 'scale-100 opacity-80'
        }`}
      />

      {/* 3D Ivory Bone Die Face */}
      <div
        className={`relative ${sizeClasses} rounded-2xl bg-gradient-to-br from-[#ffffff] via-[#f7f2e7] to-[#e4d6c1] border-2 border-[#c5b49d] flex items-center justify-center transition-all duration-300 ${
          isRolling ? 'animate-spin scale-110' : ''
        } ${isUsed ? 'opacity-30 grayscale scale-90' : 'hover:scale-105'}`}
        style={{
          boxShadow: isRolling
            ? '0 12px 24px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -3px 4px rgba(0,0,0,0.2)'
            : '0 8px 16px rgba(0,0,0,0.55), 0 3px 0 #b39f86, inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -3px 4px rgba(0,0,0,0.25)',
          transform: isRolling
            ? 'rotate(720deg) scale(1.15)'
            : undefined,
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s',
        }}
      >
        {/* 3x3 grid for indented pips */}
        <div className="w-4/5 h-4/5 grid grid-cols-3 grid-rows-3 p-0.5">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-center">
              {pips.includes(idx) && (
                <div
                  className={`${pipSize} rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)] ${
                    value === 1
                      ? 'bg-red-600 shadow-red-950 ring-1 ring-red-700/50'
                      : 'bg-[#181109] shadow-black ring-1 ring-black/30'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TavlaDice: React.FC<TavlaDiceProps> = ({
  dice,
  remainingMoves,
  isRolling,
  rollCallout,
  currentTurn,
  canRoll,
  onRoll,
}) => {
  const [d1, d2] = dice;

  const d1CountInRemaining = remainingMoves.filter((m) => m === d1).length;
  const d2CountInRemaining = remainingMoves.filter((m) => m === d2).length;

  const d1Used = d1 > 0 && d1CountInRemaining === 0;
  const d2Used = d2 > 0 && d2CountInRemaining === 0 && d1 !== d2;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-stone-900 via-[#1f1008] to-stone-900 border-2 border-amber-800/60 shadow-2xl backdrop-blur-md">
      {/* Current Turn & Turkish Callout Announcement */}
      <div className="flex items-center gap-3">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ring-4 ${
            currentTurn === 'white'
              ? 'bg-amber-100 ring-amber-400 text-stone-950 shadow-[0_0_15px_rgba(251,191,36,0.8)]'
              : 'bg-stone-950 ring-stone-600 text-amber-200 border border-amber-500'
          }`}
        >
          {currentTurn === 'white' ? '⚪' : '⚫'}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                currentTurn === 'white'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'bg-stone-800 text-amber-200 border border-stone-700'
              }`}
            >
              {currentTurn === 'white' ? 'Sıra: Beyaz (Siz)' : 'Sıra: Siyah (Bilgisayar)'}
            </span>

            {remainingMoves.length > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                {remainingMoves.length} Hamle Kaldı
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base font-black text-amber-100 tracking-wide mt-0.5">
            {rollCallout}
          </p>
        </div>
      </div>

      {/* Dice Display and Roll Button */}
      <div className="flex items-center gap-5">
        {d1 > 0 && d2 > 0 && (
          <div className="flex items-center gap-4 bg-stone-950/80 p-2.5 rounded-2xl border border-amber-900/50 shadow-inner">
            <DieFace value={d1} isRolling={isRolling} isUsed={d1Used} size="lg" />
            <DieFace value={d2} isRolling={isRolling} isUsed={d2Used} size="lg" />
          </div>
        )}

        {canRoll && (
          <button
            onClick={onRoll}
            disabled={isRolling}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/40 hover:shadow-amber-400/60 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
            <span>ZAR AT!</span>
          </button>
        )}
      </div>
    </div>
  );
};
