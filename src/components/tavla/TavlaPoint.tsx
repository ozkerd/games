import React from 'react';
import { BoardPoint, PlayerColor } from '../../games/tavla/types';
import { TavlaChecker } from './TavlaChecker';

interface TavlaPointProps {
  point: BoardPoint;
  isTopRow: boolean; // Top row points downward, bottom row points upward
  isSelected: boolean;
  isValidDestination: boolean;
  canSelect: boolean;
  onSelect: (pointIndex: number) => void;
  onMoveTo: (pointIndex: number) => void;
}

export const TavlaPoint: React.FC<TavlaPointProps> = ({
  point,
  isTopRow,
  isSelected,
  isValidDestination,
  canSelect,
  onSelect,
  onMoveTo,
}) => {
  // Alternating triangle color: odd vs even points
  const isOdd = point.index % 2 !== 0;
  // Sedef (Ivory/pearl) vs Abanoz (Deep walnut/ebony)
  const isPearl = isOdd;

  const handleClick = () => {
    if (isValidDestination) {
      onMoveTo(point.index);
    } else if (canSelect && point.count > 0) {
      onSelect(point.index);
    }
  };

  // Stack calculation: max 5 visible checkers, with count on the last one if > 5
  const visibleCount = Math.min(point.count, 5);
  const checkersList: PlayerColor[] = point.color
    ? Array.from({ length: visibleCount }, () => point.color!)
    : [];

  return (
    <div
      onClick={handleClick}
      className={`relative flex-1 h-full min-w-[36px] sm:min-w-[46px] md:min-w-[56px] flex flex-col items-center justify-between cursor-pointer group transition-all duration-200 select-none ${
        isTopRow ? 'justify-start' : 'justify-end'
      } ${
        isValidDestination
          ? 'bg-amber-400/15 ring-2 ring-emerald-400 ring-inset shadow-inner'
          : isSelected
          ? 'bg-amber-400/20'
          : 'hover:bg-amber-100/5'
      }`}
    >
      {/* Authentic Inlaid Triangle Graphic (SVG) */}
      <svg
        className={`absolute inset-0 w-full h-full pointer-events-none ${
          isTopRow ? '' : 'rotate-180'
        }`}
        preserveAspectRatio="none"
        viewBox="0 0 100 240"
      >
        <defs>
          {/* Pearl Inlay Gradient */}
          <linearGradient id={`pearlGrad-${point.index}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dfd2c0" />
            <stop offset="50%" stopColor="#f3eae0" />
            <stop offset="100%" stopColor="#c5b29c" />
          </linearGradient>
          {/* Ebony / Dark Walnut Inlay Gradient */}
          <linearGradient id={`ebonyGrad-${point.index}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3d2113" />
            <stop offset="50%" stopColor="#251208" />
            <stop offset="100%" stopColor="#150904" />
          </linearGradient>
        </defs>

        {/* Outer Triangle Inlay Border */}
        <polygon
          points="0,0 100,0 50,225"
          fill={isPearl ? `url(#pearlGrad-${point.index})` : `url(#ebonyGrad-${point.index})`}
          stroke="#5c3822"
          strokeWidth="1.5"
          className="transition-all duration-200"
        />

        {/* Inner Marquetry Line */}
        <polygon
          points="8,4 92,4 50,210"
          fill="none"
          stroke={isPearl ? '#a8937d' : '#4d2a17'}
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.7"
        />
      </svg>

      {/* Point Coordinate Number Badge */}
      <div
        className={`z-10 text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm ${
          isTopRow ? 'mt-1' : 'mb-1 order-last'
        } ${
          isSelected
            ? 'bg-amber-500 text-stone-950 font-black scale-110 shadow'
            : isValidDestination
            ? 'bg-emerald-500 text-stone-950 font-black animate-pulse'
            : isPearl
            ? 'text-stone-800 bg-stone-200/40'
            : 'text-amber-200/80 bg-stone-900/50'
        }`}
      >
        {point.index}
      </div>

      {/* Valid Destination Indicator Glow / Target */}
      {isValidDestination && (
        <div
          className={`absolute z-20 w-8 h-8 rounded-full border-2 border-emerald-400 bg-emerald-500/30 flex items-center justify-center animate-pulse ${
            isTopRow ? 'top-14' : 'bottom-14'
          }`}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
        </div>
      )}

      {/* Stacked Checkers in this Point */}
      <div
        className={`z-10 flex flex-col items-center pointer-events-auto py-1.5 ${
          isTopRow ? 'flex-col space-y-[-10px] sm:space-y-[-12px]' : 'flex-col-reverse space-y-reverse space-y-[-10px] sm:space-y-[-12px]'
        }`}
      >
        {checkersList.map((col, idx) => {
          const isLast = idx === checkersList.length - 1;
          const showBadge = isLast && point.count > 5 ? point.count : undefined;

          return (
            <TavlaChecker
              key={idx}
              color={col}
              isSelected={isSelected && isLast}
              isMovable={canSelect && isLast}
              countBadge={showBadge}
              onClick={handleClick}
            />
          );
        })}
      </div>
    </div>
  );
};
