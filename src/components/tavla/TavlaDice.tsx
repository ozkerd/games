import React, { useState, useEffect } from 'react';
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

// 6 standard dice pip configurations (0-8 in 3x3 grid)
const DICE_PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

// Realistic Chamfered Bone / Melamine Die Face with Dynamic Tumbler
export const RealisticDie: React.FC<{
  value: number;
  isRolling: boolean;
  isUsed?: boolean;
  dieIndex?: 1 | 2;
  size?: number;
}> = ({ value, isRolling, isUsed = false, dieIndex = 1, size = 52 }) => {
  const [displayValue, setDisplayValue] = useState(value || 1);

  // During rolling, cycle random faces rapidly to simulate realistic physical tumbling
  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 50);
      return () => clearInterval(interval);
    } else {
      setDisplayValue(value || 1);
    }
  }, [isRolling, value]);

  const pips = DICE_PIPS[displayValue] || [4];

  // Upward roll from player's hand onto board
  const rollClass = isRolling
    ? dieIndex === 1
      ? 'animate-hand-roll-1'
      : 'animate-hand-roll-2'
    : '';

  const shadowClass = isRolling
    ? dieIndex === 1
      ? 'animate-hand-shadow-1'
      : 'animate-hand-shadow-2'
    : 'scale-100 opacity-80';

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{
        width: `${size + 14}px`,
        height: `${size + 14}px`,
      }}
    >
      {/* Dynamic 3D Cast Shadow */}
      <div
        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3.5 rounded-full bg-black/80 blur-sm pointer-events-none transition-all duration-300 ${shadowClass}`}
      />

      {/* Realistic Chamfered Bone / Melamine Die Face */}
      <div
        className={`relative rounded-2xl flex items-center justify-center transition-all ${rollClass} ${
          isUsed ? 'opacity-35 grayscale scale-90' : 'hover:scale-105'
        }`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: 'linear-gradient(145deg, #ffffff 0%, #faf5ea 50%, #ebdcc9 100%)',
          border: '2px solid #c8b7a0',
          boxShadow: isRolling
            ? '0 14px 28px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.95), inset 0 -3px 4px rgba(0,0,0,0.25)'
            : '0 8px 16px rgba(0,0,0,0.55), 0 3px 0 #b39f86, inset 0 2px 4px rgba(255,255,255,0.95), inset 0 -3px 4px rgba(0,0,0,0.2)',
        }}
      >
        {/* Specular Gloss Reflection Arc */}
        <div className="absolute top-0.5 left-1 right-1 h-1/3 rounded-t-xl bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none" />

        {/* 3x3 Grid for Pips */}
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 p-1.5 pointer-events-none">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-center">
              {pips.includes(idx) && (
                <div
                  className={`rounded-full transition-all duration-75 ${
                    displayValue === 1
                      ? 'w-3.5 h-3.5 bg-gradient-to-br from-red-500 via-red-600 to-red-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)] ring-1 ring-red-900/60'
                      : 'w-2.5 h-2.5 bg-gradient-to-br from-[#2a1c12] to-[#0a0502] shadow-[inset_0_1px_2px_rgba(0,0,0,0.95)] ring-1 ring-black/40'
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
          className={`w-7 h-7 rounded-full flex items-center justify-center ring-4 shadow-lg ${
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
              className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                currentTurn === 'white'
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'bg-stone-800 text-amber-200 border border-stone-700'
              }`}
            >
              {currentTurn === 'white' ? 'Sıra: Beyaz (Siz)' : 'Sıra: Siyah'}
            </span>

            {remainingMoves.length > 0 && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                {remainingMoves.length} Hamle Kaldı
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base font-black text-amber-100 tracking-wide mt-0.5">
            {rollCallout}
          </p>
        </div>
      </div>

      {/* Realistic Dice Display and Roll Button */}
      <div className="flex items-center gap-5">
        {d1 > 0 && d2 > 0 && (
          <div className="flex items-center gap-4 bg-stone-950/85 p-2 rounded-2xl border border-amber-900/60 shadow-inner">
            <RealisticDie value={d1} isRolling={isRolling} isUsed={d1Used} dieIndex={1} size={50} />
            <RealisticDie value={d2} isRolling={isRolling} isUsed={d2Used} dieIndex={2} size={50} />
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
