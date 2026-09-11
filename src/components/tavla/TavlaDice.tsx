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

// 6 standard dice pip configurations (0-8 in 3x3 grid)
const DICE_PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

// Target 3D rotations to bring a specific face (1 to 6) to the front
const CUBE_ROTATIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  6: { x: 0, y: 180 },
  2: { x: 0, y: -90 },
  5: { x: 0, y: 90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
};

export const DieFaceFlat: React.FC<{ value: number; size?: 'sm' | 'md' | 'lg' }> = ({
  value,
  size = 'md',
}) => {
  const pips = DICE_PIPS[value] || [4];
  const pipSize = size === 'lg' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-2 h-2' : 'w-1.5 h-1.5';

  return (
    <div className="w-full h-full p-1 grid grid-cols-3 grid-rows-3 bg-gradient-to-br from-[#ffffff] via-[#f7f2e8] to-[#e4d6c2] border border-[#bfae98] rounded-xl shadow-[inset_0_1px_3px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.2)]">
      {Array.from({ length: 9 }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-center">
          {pips.includes(idx) && (
            <div
              className={`${pipSize} rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)] ${
                value === 1 ? 'bg-red-600 ring-1 ring-red-800' : 'bg-[#150d06] ring-1 ring-black/40'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// True 3D Cube Die
export const Die3DCube: React.FC<{
  value: number;
  isRolling: boolean;
  isUsed?: boolean;
  size?: number;
}> = ({ value, isRolling, isUsed = false, size = 52 }) => {
  const half = size / 2;
  const targetRotation = CUBE_ROTATIONS[value || 1] || { x: 0, y: 0 };

  return (
    <div
      className="relative select-none flex items-center justify-center"
      style={{
        width: `${size + 16}px`,
        height: `${size + 16}px`,
        perspective: '800px',
      }}
    >
      {/* Dynamic 3D Cast Shadow */}
      <div
        className={`absolute -bottom-2 w-12 h-4 rounded-full bg-black/75 blur-sm transition-all duration-300 pointer-events-none ${
          isRolling ? 'scale-75 opacity-40 translate-y-2' : 'scale-100 opacity-80'
        }`}
      />

      {/* 3D Rotating Cube Container */}
      <div
        className={`relative transition-all ${
          isRolling ? 'animate-bounce' : ''
        } ${isUsed ? 'opacity-35 grayscale scale-90' : 'hover:scale-105'}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          transformStyle: 'preserve-3d',
          transform: isRolling
            ? 'rotateX(720deg) rotateY(1080deg) rotateZ(360deg)'
            : `rotateX(${targetRotation.x}deg) rotateY(${targetRotation.y}deg)`,
          transition: isRolling
            ? 'transform 0.8s cubic-bezier(0.2, 0.8, 0.4, 1.2)'
            : 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s',
        }}
      >
        {/* Face 1 (Front: Z+) */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{ transform: `translateZ(${half}px)` }}
        >
          <DieFaceFlat value={1} size="md" />
        </div>

        {/* Face 6 (Back: Z-) */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{ transform: `rotateY(180deg) translateZ(${half}px)` }}
        >
          <DieFaceFlat value={6} size="md" />
        </div>

        {/* Face 2 (Right: X+) */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{ transform: `rotateY(90deg) translateZ(${half}px)` }}
        >
          <DieFaceFlat value={2} size="md" />
        </div>

        {/* Face 5 (Left: X-) */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{ transform: `rotateY(-90deg) translateZ(${half}px)` }}
        >
          <DieFaceFlat value={5} size="md" />
        </div>

        {/* Face 3 (Top: Y+) */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{ transform: `rotateX(90deg) translateZ(${half}px)` }}
        >
          <DieFaceFlat value={3} size="md" />
        </div>

        {/* Face 4 (Bottom: Y-) */}
        <div
          className="absolute inset-0 backface-hidden"
          style={{ transform: `rotateX(-90deg) translateZ(${half}px)` }}
        >
          <DieFaceFlat value={4} size="md" />
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

      {/* 3D Dice Display and Roll Button */}
      <div className="flex items-center gap-5">
        {d1 > 0 && d2 > 0 && (
          <div className="flex items-center gap-3 bg-stone-950/80 p-2 rounded-2xl border border-amber-900/50 shadow-inner">
            <Die3DCube value={d1} isRolling={isRolling} isUsed={d1Used} size={48} />
            <Die3DCube value={d2} isRolling={isRolling} isUsed={d2Used} size={48} />
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
