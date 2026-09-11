import React from 'react';
import { BoardPoint, PlayerColor } from '../../games/tavla/types';
import { TavlaChecker } from './TavlaChecker';
import { Sparkles } from 'lucide-react';

interface TavlaPointProps {
  point: BoardPoint;
  isTopRow: boolean; // Top row triangles point DOWN, bottom row triangles point UP
  isSelected: boolean;
  isValidDestination: boolean;
  isHintOrigin?: boolean;
  isHintTarget?: boolean;
  isStepping?: boolean;
  canSelect: boolean;
  onSelect: (pointIndex: number) => void;
  onMoveTo: (pointIndex: number) => void;
}

export const TavlaPoint: React.FC<TavlaPointProps> = ({
  point,
  isTopRow,
  isSelected,
  isValidDestination,
  isHintOrigin = false,
  isHintTarget = false,
  isStepping = false,
  canSelect,
  onSelect,
  onMoveTo,
}) => {
  // Odd/even alternating point colors
  const isOdd = point.index % 2 !== 0;
  // Sedef (Ivory/Pearl) vs Abanoz (Deep Mahogany/Ebony)
  const isPearl = isOdd;

  const handleClick = () => {
    if (isValidDestination) {
      onMoveTo(point.index);
    } else if (canSelect && point.count > 0) {
      onSelect(point.index);
    }
  };

  // Stack calculation: up to 5 visible checkers, with count on the top checker if > 5
  const visibleCount = Math.min(point.count, 5);
  const checkersList: PlayerColor[] = point.color
    ? Array.from({ length: visibleCount }, () => point.color!)
    : [];

  return (
    <div
      onClick={handleClick}
      className={`relative flex-1 h-full min-w-[38px] sm:min-w-[48px] md:min-w-[58px] cursor-pointer group select-none transition-all duration-150 ${
        isHintTarget
          ? 'bg-amber-400/30 ring-3 ring-amber-400 ring-inset shadow-[0_0_20px_rgba(251,191,36,0.6)]'
          : isValidDestination
          ? 'bg-emerald-500/25 ring-2 ring-emerald-400 ring-inset shadow-[0_0_15px_rgba(52,211,153,0.4)]'
          : isHintOrigin
          ? 'bg-amber-400/20 ring-2 ring-amber-300 ring-inset'
          : isSelected
          ? 'bg-amber-400/25 ring-2 ring-amber-400 ring-inset'
          : 'hover:bg-amber-400/5'
      }`}
    >
      {/* High-Contrast Inlaid Triangle Graphic (SVG) */}
      <svg
        className={`absolute inset-0 w-full h-full pointer-events-none ${
          isTopRow ? '' : 'rotate-180'
        }`}
        preserveAspectRatio="none"
        viewBox="0 0 100 250"
      >
        <defs>
          {/* Luminous Pearl Inlay Gradient */}
          <linearGradient id={`pearlGrad-${point.index}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#f7eee1" />
            <stop offset="100%" stopColor="#dfcbaf" />
          </linearGradient>
          {/* Deep Mahogany / Ebony Inlay Gradient */}
          <linearGradient id={`ebonyGrad-${point.index}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#451e0f" />
            <stop offset="50%" stopColor="#291107" />
            <stop offset="100%" stopColor="#120602" />
          </linearGradient>
        </defs>

        {/* Triangle Body */}
        <polygon
          points="0,0 100,0 50,235"
          fill={isPearl ? `url(#pearlGrad-${point.index})` : `url(#ebonyGrad-${point.index})`}
          stroke={isPearl ? '#8a5c39' : '#572d16'}
          strokeWidth="2"
        />

        {/* Inner Marquetry Inlay Accent Line */}
        <polygon
          points="10,4 90,4 50,215"
          fill="none"
          stroke={isPearl ? '#c9ab8f' : '#733c1f'}
          strokeWidth="1.5"
          strokeDasharray="4,2"
          opacity="0.85"
        />
      </svg>

      {/* Point Coordinate Number Badge */}
      <div
        className={`absolute z-20 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-mono font-black px-1.5 py-0.5 rounded-full shadow-md backdrop-blur-sm pointer-events-none ${
          isTopRow ? 'bottom-2' : 'top-2'
        } ${
          isHintTarget
            ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300 scale-125 font-black shadow-lg shadow-amber-500/50'
            : isSelected
            ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-500 scale-110'
            : isValidDestination
            ? 'bg-emerald-400 text-stone-950 ring-2 ring-emerald-500 animate-pulse'
            : isPearl
            ? 'bg-stone-900/80 text-amber-200 border border-amber-900/60'
            : 'bg-stone-950/85 text-amber-300 border border-amber-700/60'
        }`}
      >
        {point.index}
      </div>

      {/* Hint Target Visual Highlight Badge */}
      {isHintTarget && (
        <div
          className={`absolute z-30 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black shadow-xl animate-bounce border-2 border-white ${
            isTopRow ? 'top-14' : 'bottom-14'
          }`}
        >
          <Sparkles className="w-3 h-3 fill-current" />
          <span>HEDEF</span>
        </div>
      )}

      {/* Valid Destination Indicator Glow / Target */}
      {isValidDestination && !isHintTarget && (
        <div
          className={`absolute z-30 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-emerald-400 bg-emerald-500/40 flex items-center justify-center animate-bounce shadow-lg shadow-emerald-500/50 ${
            isTopRow ? 'top-16' : 'bottom-16'
          }`}
        >
          <div className="w-3 h-3 rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7]" />
        </div>
      )}

      {/* Step-by-Step Moving Checker Gliding Indicator */}
      {isStepping && (
        <div
          className={`absolute z-40 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none transition-all duration-200 scale-110 ${
            isTopRow ? 'top-10' : 'bottom-10'
          }`}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border-2 border-amber-100 shadow-[0_0_30px_#f59e0b] animate-bounce flex items-center justify-center ring-4 ring-amber-400/50">
            <div className="w-5 h-5 rounded-full bg-amber-100/90 shadow-inner" />
          </div>
        </div>
      )}

      {/* Checkers Stack - FLUSH to Top Rail or Bottom Rail */}
      <div
        className={`absolute left-0 right-0 z-10 flex flex-col items-center pointer-events-auto ${
          isTopRow
            ? 'top-0 flex-col space-y-[-12px] sm:space-y-[-16px] md:space-y-[-18px]'
            : 'bottom-0 flex-col-reverse space-y-reverse space-y-[-12px] sm:space-y-[-16px] md:space-y-[-18px]'
        }`}
      >
        {checkersList.map((col, idx) => {
          const isTopMost = idx === checkersList.length - 1;
          const showBadge = isTopMost && point.count > 5 ? point.count : undefined;

          return (
            <TavlaChecker
              key={idx}
              color={col}
              isSelected={(isSelected || isHintOrigin) && isTopMost}
              isMovable={canSelect && isTopMost}
              countBadge={showBadge}
              onClick={handleClick}
            />
          );
        })}
      </div>
    </div>
  );
};
