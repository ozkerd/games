import React from 'react';
import { Tile, TileColor } from '../../games/okey/types';
import { Sparkles, Star } from 'lucide-react';

interface OkeyTileProps {
  tile: Tile | null;
  isOkey?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  onDoubleClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

const COLOR_CLASSES: Record<TileColor, { text: string; shadow: string; border: string }> = {
  red: {
    text: 'text-rose-600 drop-shadow-[0_1px_1px_rgba(225,29,72,0.4)]',
    shadow: 'shadow-rose-900/30',
    border: 'border-rose-400/40',
  },
  yellow: {
    text: 'text-amber-500 drop-shadow-[0_1px_1px_rgba(245,158,11,0.5)]',
    shadow: 'shadow-amber-900/30',
    border: 'border-amber-400/40',
  },
  blue: {
    text: 'text-blue-600 drop-shadow-[0_1px_1px_rgba(37,99,235,0.4)]',
    shadow: 'shadow-blue-900/30',
    border: 'border-blue-400/40',
  },
  black: {
    text: 'text-slate-900 drop-shadow-[0_1px_1px_rgba(15,23,42,0.5)]',
    shadow: 'shadow-slate-900/40',
    border: 'border-slate-500/40',
  },
  fake: {
    text: 'text-amber-600',
    shadow: 'shadow-amber-900/30',
    border: 'border-amber-400/40',
  },
};

const SIZE_CONFIGS = {
  sm: 'w-7 h-10 text-xs sm:w-8 sm:h-11 sm:text-sm',
  md: 'w-8 h-12 text-sm sm:w-10 sm:h-14 sm:text-lg',
  lg: 'w-11 h-16 text-lg sm:w-12 sm:h-18 sm:text-2xl',
};

export const OkeyTile: React.FC<OkeyTileProps> = ({
  tile,
  isOkey = false,
  isSelected = false,
  isHighlighted = false,
  size = 'md',
  onClick,
  onDoubleClick,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  if (!tile) {
    return (
      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={onClick}
        className={`${SIZE_CONFIGS[size]} rounded-md border border-amber-950/40 bg-amber-950/20 shadow-inner flex items-center justify-center transition-all`}
      />
    );
  }

  const colorConfig = COLOR_CLASSES[tile.color] || COLOR_CLASSES.black;

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`relative select-none cursor-pointer flex flex-col items-center justify-center rounded-lg font-display font-extrabold transition-all duration-150 transform ${
        SIZE_CONFIGS[size]
      } ${
        isSelected
          ? '-translate-y-2 ring-2 ring-amber-400 shadow-xl shadow-amber-500/30 scale-105'
          : isHighlighted
          ? 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/40 -translate-y-0.5'
          : 'hover:-translate-y-0.5 active:translate-y-0 shadow-md'
      }`}
      style={{
        // Melamine ivory gradient & 3D bevel box-shadow
        background: isHighlighted
          ? 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 60%, #dcfce7 100%)'
          : 'linear-gradient(145deg, #fffdfa 0%, #fef7ed 60%, #fde68a 100%)',
        boxShadow: isSelected
          ? '0 10px 18px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.9), inset 0 -2px 3px rgba(180, 83, 9, 0.2)'
          : isHighlighted
          ? '0 6px 12px -1px rgba(16, 185, 129, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.9), inset 0 -2px 3px rgba(5, 150, 105, 0.3)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.35), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.9), inset 0 -2px 3px rgba(180, 83, 9, 0.25)',
        border: isHighlighted ? '1.5px solid #34d399' : '1px solid #fef3c7',
        borderBottom: isHighlighted ? '3px solid #059669' : '3px solid #d97706',
      }}
    >
      {/* Highlighted check badge for tiles forming valid melds */}
      {isHighlighted && !isOkey && (
        <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-white shadow-sm z-10">
          <span className="text-[8px] font-black leading-none">✓</span>
        </div>
      )}
      {/* Okey Badge if this tile is the Okey joker */}
      {isOkey && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 border border-white flex items-center justify-center text-white shadow-sm z-10 animate-pulse">
          <Sparkles className="w-2.5 h-2.5 fill-current" />
        </div>
      )}

      {/* Tile Content */}
      {tile.isFakeOkey ? (
        <div className="flex flex-col items-center justify-center text-amber-600">
          <Star className="w-4 h-4 fill-amber-500 stroke-amber-600 drop-shadow-sm" />
          <span className="text-[9px] font-bold tracking-tighter uppercase text-amber-700 mt-0.5">
            SAHTE
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center leading-none">
          <span className={`${colorConfig.text} tracking-tight drop-shadow-sm font-black`}>
            {tile.number}
          </span>
          {/* Subtle color dot indicator below number */}
          <div
            className={`w-1.5 h-1.5 rounded-full mt-0.5 opacity-80 ${
              tile.color === 'red'
                ? 'bg-rose-600'
                : tile.color === 'yellow'
                ? 'bg-amber-500'
                : tile.color === 'blue'
                ? 'bg-blue-600'
                : 'bg-slate-900'
            }`}
          />
        </div>
      )}
    </div>
  );
};
