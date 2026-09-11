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
}

// 6 standard dice pip configurations
const DICE_PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const DieFace: React.FC<{ value: number; isRolling: boolean; isUsed: boolean }> = ({
  value,
  isRolling,
  isUsed,
}) => {
  const pips = DICE_PIPS[value] || [];

  return (
    <div
      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#faf8f5] via-[#f0e8dc] to-[#dfd3c3] border-2 border-[#b59e86] shadow-[0_8px_16px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all duration-300 ${
        isRolling ? 'animate-bounce rotate-12 scale-105' : ''
      } ${isUsed ? 'opacity-35 grayscale scale-95' : 'hover:scale-105'}`}
      style={{
        transform: isRolling
          ? 'rotateX(360deg) rotateY(180deg) rotateZ(45deg)'
          : undefined,
        transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* 3x3 grid for pips */}
      <div className="w-9 h-9 sm:w-10 sm:h-10 grid grid-cols-3 grid-rows-3 p-0.5">
        {Array.from({ length: 9 }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-center">
            {pips.includes(idx) && (
              <div
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shadow-inner ${
                  value === 1
                    ? 'bg-red-700 shadow-red-950/60'
                    : 'bg-stone-900 shadow-stone-950/80'
                }`}
              />
            )}
          </div>
        ))}
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

  // Determine which dice values are used
  // If remainingMoves has count of d1 or d2
  const d1CountInRemaining = remainingMoves.filter((m) => m === d1).length;
  const d2CountInRemaining = remainingMoves.filter((m) => m === d2).length;

  const d1Used = d1 > 0 && d1CountInRemaining === 0;
  const d2Used = d2 > 0 && d2CountInRemaining === 0 && d1 !== d2;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3 rounded-2xl bg-stone-900/90 border border-amber-900/50 shadow-2xl backdrop-blur-md">
      {/* Turkish Dice Callout & Turn Info */}
      <div className="flex items-center gap-3">
        <div
          className={`w-3.5 h-3.5 rounded-full ring-4 ${
            currentTurn === 'white'
              ? 'bg-amber-100 ring-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
              : 'bg-stone-900 ring-amber-700/50 border border-amber-500'
          }`}
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              {currentTurn === 'white' ? 'Sıra: Beyaz (Siz)' : 'Sıra: Siyah'}
            </span>
            {remainingMoves.length > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {remainingMoves.length} Hamle Kaldı
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base font-bold text-stone-200 tracking-wide">
            {rollCallout}
          </p>
        </div>
      </div>

      {/* Dice & Roll Action */}
      <div className="flex items-center gap-4">
        {d1 > 0 && d2 > 0 && (
          <div className="flex items-center gap-3 bg-stone-950/70 p-2 rounded-2xl border border-stone-800 shadow-inner">
            <DieFace value={d1} isRolling={isRolling} isUsed={d1Used} />
            <DieFace value={d2} isRolling={isRolling} isUsed={d2Used} />
          </div>
        )}

        {/* Roll Button */}
        {canRoll && (
          <button
            onClick={onRoll}
            disabled={isRolling}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-amber-600/30 hover:shadow-amber-500/50 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
            <span>Zar At!</span>
          </button>
        )}
      </div>
    </div>
  );
};
