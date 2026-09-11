import React from 'react';
import { PlayerColor } from '../../games/tavla/types';

interface TavlaCheckerProps {
  color: PlayerColor;
  isSelected?: boolean;
  isMovable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  countBadge?: number;
  onClick?: () => void;
}

export const TavlaChecker: React.FC<TavlaCheckerProps> = ({
  color,
  isSelected = false,
  isMovable = false,
  size = 'md',
  countBadge,
  onClick,
}) => {
  const isWhite = color === 'white';

  const sizeClasses = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`relative rounded-full select-none cursor-pointer transition-all duration-200 ${sizeClasses} ${
        isSelected
          ? 'scale-110 z-30 ring-4 ring-amber-400 ring-offset-2 ring-offset-stone-950 animate-pulse'
          : isMovable
          ? 'hover:scale-105 hover:ring-2 hover:ring-amber-300 z-10'
          : 'z-0'
      }`}
      style={{
        // Real 3D cylinder bevel and drop shadow
        boxShadow: isWhite
          ? isSelected
            ? '0 6px 0 #bfa88c, 0 10px 18px rgba(0,0,0,0.65), 0 0 20px rgba(251,191,36,0.8)'
            : '0 5px 0 #b39b7d, 0 8px 14px rgba(0,0,0,0.6)'
          : isSelected
          ? '0 6px 0 #0d0704, 0 10px 18px rgba(0,0,0,0.85), 0 0 20px rgba(251,191,36,0.8)'
          : '0 5px 0 #120905, 0 8px 14px rgba(0,0,0,0.8)',
      }}
    >
      {/* Checker Top Face */}
      <div
        className={`w-full h-full rounded-full flex items-center justify-center relative overflow-hidden border ${
          isWhite
            ? 'bg-gradient-to-br from-[#ffffff] via-[#f7f2ea] to-[#e4d6c4] border-[#d8c8b4]'
            : 'bg-gradient-to-br from-[#2a170d] via-[#150a04] to-[#080301] border-[#3f2212]'
        }`}
      >
        {/* Gloss Specular Highlight (Reflection Arc) */}
        <div
          className={`absolute -top-1 -left-1 w-3/4 h-1/2 rounded-full pointer-events-none opacity-70 ${
            isWhite
              ? 'bg-gradient-to-b from-white via-white/40 to-transparent'
              : 'bg-gradient-to-b from-stone-400/50 via-stone-400/10 to-transparent'
          }`}
        />

        {/* Outer Inlaid Concentric Ring */}
        <div
          className={`w-4/5 h-4/5 rounded-full border-2 flex items-center justify-center shadow-inner ${
            isWhite
              ? 'border-amber-700/30 bg-gradient-to-br from-[#f5ede2] to-[#e0d0bc]'
              : 'border-amber-600/40 bg-gradient-to-br from-[#1d0d06] to-[#0b0402]'
          }`}
        >
          {/* Inner Inlaid Concentric Ring */}
          <div
            className={`w-3/5 h-3/5 rounded-full border flex items-center justify-center ${
              isWhite
                ? 'border-amber-800/25 bg-[#eee3d3]'
                : 'border-amber-500/30 bg-[#140803]'
            }`}
          >
            {/* Center Mother-of-Pearl / Brass Pip */}
            <div
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-inner ${
                isWhite
                  ? 'bg-gradient-to-br from-amber-200 to-amber-500 border border-amber-600/40'
                  : 'bg-gradient-to-br from-amber-500 to-amber-800 border border-amber-400/50'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Stack Count Badge (when pile has more than 1 checker or >= 5) */}
      {countBadge && countBadge > 1 && (
        <span
          className={`absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[20px] rounded-full text-[11px] font-black text-center shadow-xl border-2 z-40 ${
            isWhite
              ? 'bg-amber-600 text-white border-amber-200'
              : 'bg-stone-900 text-amber-300 border-amber-500'
          }`}
        >
          {countBadge}
        </span>
      )}
    </div>
  );
};
