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

// Settle rotation to face the rolled number directly to the camera with organic tilt
export const getSettleRotation = (value: number, dieIndex: 1 | 2 = 1): string => {
  const zTilt = dieIndex === 1 ? -6 : 8;
  switch (value) {
    case 1:
      return `rotateX(0deg) rotateY(0deg) rotateZ(${zTilt}deg)`;
    case 6:
      return `rotateX(0deg) rotateY(180deg) rotateZ(${zTilt}deg)`;
    case 2:
      return `rotateX(-90deg) rotateY(0deg) rotateZ(${zTilt}deg)`;
    case 5:
      return `rotateX(90deg) rotateY(0deg) rotateZ(${zTilt}deg)`;
    case 3:
      return `rotateX(0deg) rotateY(90deg) rotateZ(${zTilt}deg)`;
    case 4:
      return `rotateX(0deg) rotateY(-90deg) rotateZ(${zTilt}deg)`;
    default:
      return `rotateX(0deg) rotateY(0deg) rotateZ(${zTilt}deg)`;
  }
};

// True 3D Melamine/Bone Die Cube with 6 Faces and 3D Rolling Tumbler
export const RealisticDie: React.FC<{
  value: number;
  isRolling: boolean;
  isUsed?: boolean;
  dieIndex?: 1 | 2;
  size?: number;
}> = ({ value, isRolling, isUsed = false, dieIndex = 1, size = 52 }) => {
  const half = Math.round(size / 2);
  const settleRotation = getSettleRotation(value || 1, dieIndex);

  const rollClass = isRolling
    ? dieIndex === 1
      ? 'animate-3d-roll-1'
      : 'animate-3d-roll-2'
    : '';

  const shadowClass = isRolling
    ? dieIndex === 1
      ? 'animate-3d-shadow-1'
      : 'animate-3d-shadow-2'
    : 'filter blur-[4px] scale-100 opacity-80';

  const renderFace = (faceNum: number, transform: string) => {
    const pips = DICE_PIPS[faceNum] || [];
    const isAce = faceNum === 1;

    return (
      <div
        className="absolute rounded-xl flex items-center justify-center p-1 select-none pointer-events-none"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          transform,
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(145deg, #ffffff 0%, #faf4eb 45%, #ebdcc9 100%)',
          boxShadow:
            'inset 0 1.5px 2px rgba(255,255,255,0.95), inset 0 -1.5px 2px rgba(0,0,0,0.18)',
          border: '1.5px solid #d4c3ae',
        }}
      >
        {/* Specular highlight gloss */}
        <div className="absolute top-0.5 left-1 right-1 h-1/3 rounded-t-lg bg-gradient-to-b from-white/70 via-white/10 to-transparent pointer-events-none" />

        {/* 3x3 Grid for Pips */}
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 p-1">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-center">
              {pips.includes(idx) && (
                <div
                  className={`rounded-full ${
                    isAce
                      ? 'w-3.5 h-3.5 bg-gradient-to-br from-red-500 via-red-600 to-red-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.85)] ring-1 ring-red-900/60'
                      : 'w-2.5 h-2.5 bg-gradient-to-br from-[#2a1c12] to-[#0a0502] shadow-[inset_0_1px_2px_rgba(0,0,0,0.95)] ring-1 ring-black/40'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="dice-perspective-container relative flex items-center justify-center select-none"
      style={{
        width: `${size + 16}px`,
        height: `${size + 16}px`,
      }}
    >
      {/* 3D Cast Shadow */}
      <div
        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3.5 rounded-full bg-black/85 transition-all duration-300 pointer-events-none ${shadowClass}`}
      />

      {/* 3D Rolling Cube */}
      <div
        className={`dice-cube ${rollClass} ${
          isUsed ? 'opacity-30 grayscale scale-90' : 'hover:scale-105'
        }`}
        style={
          {
            width: `${size}px`,
            height: `${size}px`,
            '--settle-rotation': settleRotation,
            transform: isRolling ? undefined : settleRotation,
          } as React.CSSProperties
        }
      >
        {/* 6 Opposing Faces (Opposite faces sum to 7: 1-6, 2-5, 3-4) */}
        {renderFace(1, `rotateY(0deg) translateZ(${half}px)`)}
        {renderFace(6, `rotateY(180deg) translateZ(${half}px)`)}
        {renderFace(2, `rotateX(90deg) translateZ(${half}px)`)}
        {renderFace(5, `rotateX(-90deg) translateZ(${half}px)`)}
        {renderFace(3, `rotateY(-90deg) translateZ(${half}px)`)}
        {renderFace(4, `rotateY(90deg) translateZ(${half}px)`)}
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
