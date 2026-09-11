import React from 'react';
import { PlayerColor } from '../../games/tavla/types';
import { TavlaChecker } from './TavlaChecker';
import { Download } from 'lucide-react';

interface TavlaBarProps {
  bar: Record<PlayerColor, number>;
  selectedPoint: number | 'bar' | null;
  currentTurn: PlayerColor;
  canSelectBar: boolean;
  onSelectBar: () => void;
}

export const TavlaBar: React.FC<TavlaBarProps> = ({
  bar,
  selectedPoint,
  currentTurn,
  canSelectBar,
  onSelectBar,
}) => {
  const isWhiteSelected = selectedPoint === 'bar' && currentTurn === 'white';
  const isBlackSelected = selectedPoint === 'bar' && currentTurn === 'black';

  return (
    <div className="w-10 sm:w-14 md:w-16 h-full bg-gradient-to-r from-[#241309] via-[#3a2012] to-[#241309] border-x-2 border-[#57361f] flex flex-col items-center justify-between py-4 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] relative select-none">
      {/* Brass Hinges Decorative Detail (Top & Bottom & Center) */}
      <div className="w-5 h-4 rounded-sm bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700 shadow-md border border-amber-900 flex items-center justify-around px-0.5">
        <div className="w-1 h-1 rounded-full bg-amber-950" />
        <div className="w-1 h-1 rounded-full bg-amber-950" />
      </div>

      {/* Black Hit Checkers (Top half of bar) */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[9px] font-bold uppercase text-amber-500/70 tracking-wider">
          Bar
        </span>
        {bar.black > 0 && (
          <div className="relative">
            <TavlaChecker
              color="black"
              size="md"
              isSelected={isBlackSelected}
              isMovable={canSelectBar && currentTurn === 'black'}
              countBadge={bar.black}
              onClick={canSelectBar && currentTurn === 'black' ? onSelectBar : undefined}
            />
            {currentTurn === 'black' && (
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-400 whitespace-nowrap animate-pulse">
                Girmeli
              </span>
            )}
          </div>
        )}
      </div>

      {/* Center Brass Joint */}
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 via-amber-300 to-amber-800 shadow-lg border border-amber-900 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-amber-950 shadow-inner" />
      </div>

      {/* White Hit Checkers (Bottom half of bar) */}
      <div className="flex flex-col items-center gap-1">
        {bar.white > 0 && (
          <div className="relative">
            <TavlaChecker
              color="white"
              size="md"
              isSelected={isWhiteSelected}
              isMovable={canSelectBar && currentTurn === 'white'}
              countBadge={bar.white}
              onClick={canSelectBar && currentTurn === 'white' ? onSelectBar : undefined}
            />
            {currentTurn === 'white' && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-300 whitespace-nowrap animate-pulse">
                Girmeli!
              </span>
            )}
          </div>
        )}
        <span className="text-[9px] font-bold uppercase text-amber-500/70 tracking-wider">
          Bar
        </span>
      </div>

      {/* Bottom Brass Hinge */}
      <div className="w-5 h-4 rounded-sm bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700 shadow-md border border-amber-900 flex items-center justify-around px-0.5">
        <div className="w-1 h-1 rounded-full bg-amber-950" />
        <div className="w-1 h-1 rounded-full bg-amber-950" />
      </div>
    </div>
  );
};

interface TavlaTrayProps {
  borneOff: Record<PlayerColor, number>;
  isValidBearOff: boolean;
  currentTurn: PlayerColor;
  onBearOff: () => void;
}

export const TavlaTray: React.FC<TavlaTrayProps> = ({
  borneOff,
  isValidBearOff,
  currentTurn,
  onBearOff,
}) => {
  return (
    <div className="w-14 sm:w-20 md:w-24 h-full bg-gradient-to-b from-[#211107] via-[#2f190c] to-[#211107] border-l-4 border-[#52331c] flex flex-col justify-between p-2 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] select-none">
      {/* Black Bear-Off Slot (Top) */}
      <div
        onClick={currentTurn === 'black' && isValidBearOff ? onBearOff : undefined}
        className={`h-40 rounded-xl border flex flex-col items-center justify-center p-2 transition-all ${
          currentTurn === 'black' && isValidBearOff
            ? 'bg-emerald-900/40 border-emerald-400 ring-2 ring-emerald-400 animate-pulse cursor-pointer'
            : 'bg-stone-950/40 border-amber-900/30'
        }`}
      >
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-500/80 mb-1">
          Siyah Toplama
        </span>
        <div className="text-xl sm:text-2xl font-black text-white font-mono">
          {borneOff.black} <span className="text-xs text-stone-500 font-normal">/15</span>
        </div>
        {currentTurn === 'black' && isValidBearOff && (
          <div className="mt-2 flex items-center gap-1 text-[10px] font-black text-emerald-300">
            <Download className="w-3 h-3 animate-bounce" /> TOPLA
          </div>
        )}
      </div>

      {/* Tray Wooden Divider */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-600/40 to-transparent my-2" />

      {/* White Bear-Off Slot (Bottom) */}
      <div
        onClick={currentTurn === 'white' && isValidBearOff ? onBearOff : undefined}
        className={`h-40 rounded-xl border flex flex-col items-center justify-center p-2 transition-all ${
          currentTurn === 'white' && isValidBearOff
            ? 'bg-emerald-900/40 border-emerald-400 ring-2 ring-emerald-400 animate-pulse cursor-pointer shadow-lg shadow-emerald-500/20'
            : 'bg-stone-950/40 border-amber-900/30'
        }`}
      >
        {currentTurn === 'white' && isValidBearOff && (
          <div className="mb-2 flex items-center gap-1 text-[10px] font-black text-emerald-300">
            <Download className="w-3 h-3 animate-bounce" /> TOPLA
          </div>
        )}
        <div className="text-xl sm:text-2xl font-black text-amber-200 font-mono">
          {borneOff.white} <span className="text-xs text-stone-500 font-normal">/15</span>
        </div>
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-500/80 mt-1">
          Beyaz Toplama
        </span>
      </div>
    </div>
  );
};
