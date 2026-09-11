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
  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 sm:w-11 sm:h-11 text-xs',
    lg: 'w-12 h-12 text-sm',
  }[size];

  const isWhite = color === 'white';

  return (
    <div
      onClick={onClick}
      className={`relative rounded-full flex items-center justify-center select-none transition-all duration-200 cursor-pointer ${sizeClasses} ${
        isSelected
          ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-stone-900 scale-110 shadow-lg shadow-amber-500/50 z-20'
          : isMovable
          ? 'hover:scale-105 hover:shadow-md hover:ring-2 hover:ring-amber-300/80 cursor-pointer'
          : ''
      } ${
        isWhite
          ? 'bg-gradient-to-br from-[#faf6ee] via-[#e8dcce] to-[#cfbeaa] text-stone-800 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.3)] border border-[#d6c7b2]'
          : 'bg-gradient-to-br from-[#3b2314] via-[#24140a] to-[#120804] text-amber-100 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.9)] border border-[#4a2e1b]'
      }`}
    >
      {/* Authentic concentric inlay ring */}
      <div
        className={`w-3/4 h-3/4 rounded-full border flex items-center justify-center ${
          isWhite
            ? 'border-stone-400/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]'
            : 'border-amber-700/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]'
        }`}
      >
        {/* Center decorative mother-of-pearl / brass dot */}
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isWhite
              ? 'bg-gradient-to-br from-amber-100 to-stone-400 shadow-inner'
              : 'bg-gradient-to-br from-amber-600 to-stone-900 shadow-inner'
          }`}
        />
      </div>

      {/* Stack Count Badge (if count > 5 or provided) */}
      {countBadge && countBadge > 1 && (
        <span
          className={`absolute -top-1.5 -right-1.5 px-1.5 py-0.5 min-w-[18px] rounded-full text-[10px] font-bold text-center shadow-md border ${
            isWhite
              ? 'bg-amber-600 text-white border-amber-400'
              : 'bg-stone-900 text-amber-300 border-amber-600'
          }`}
        >
          {countBadge}
        </span>
      )}
    </div>
  );
};
