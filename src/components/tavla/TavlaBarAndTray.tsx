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
    <div className="w-12 sm:w-16 md:w-18 h-full bg-gradient-to-r from-[#1c0d05] via-[#33180b] to-[#1c0d05] border-x-4 border-[#61361b] flex flex-col items-center justify-between py-5 shadow-[inset_0_0_20px_rgba(0,0,0,0.95)] relative select-none">
      {/* Brass Hinge (Top) */}
      <div className="w-6 h-5 rounded bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700 shadow-lg border border-amber-900 flex items-center justify-around px-0.5">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-950" />
        <div className="w-1.5 h-1.5 rounded-full bg-amber-950" />
      </div>

      {/* Black Hit Checkers (Top half) */}
      <div className="flex flex-col items-center gap-1.5 z-20">
        <span className="text-[10px] font-black uppercase text-amber-400/90 tracking-widest bg-stone-950/80 px-1.5 py-0.5 rounded border border-amber-900/50">
          BAR
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
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-amber-300 bg-stone-900/95 px-1 rounded whitespace-nowrap animate-pulse border border-amber-500">
                GİRMELİ!
              </span>
            )}
          </div>
        )}
      </div>

      {/* Center Brass Lock Plate */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 via-amber-200 to-amber-700 shadow-xl border-2 border-amber-950 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-950 shadow-inner" />
      </div>

      {/* White Hit Checkers (Bottom half) */}
      <div className="flex flex-col items-center gap-1.5 z-20">
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
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-amber-300 bg-stone-900/95 px-1 rounded whitespace-nowrap animate-pulse border border-amber-500">
                GİRMELİ!
              </span>
            )}
          </div>
        )}
        <span className="text-[10px] font-black uppercase text-amber-400/90 tracking-widest bg-stone-950/80 px-1.5 py-0.5 rounded border border-amber-900/50">
          BAR
        </span>
      </div>

      {/* Brass Hinge (Bottom) */}
      <div className="w-6 h-5 rounded bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700 shadow-lg border border-amber-900 flex items-center justify-around px-0.5">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-950" />
        <div className="w-1.5 h-1.5 rounded-full bg-amber-950" />
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
    <div className="w-16 sm:w-24 md:w-28 h-full bg-gradient-to-b from-[#180b04] via-[#281308] to-[#180b04] border-l-4 border-[#5a3219] flex flex-col justify-between p-2.5 shadow-[inset_0_0_25px_rgba(0,0,0,0.95)] select-none">
      {/* Black Bear-Off Slot (Top) */}
      <div
        onClick={currentTurn === 'black' && isValidBearOff ? onBearOff : undefined}
        className={`flex-1 max-h-[220px] rounded-2xl border-2 flex flex-col items-center justify-between p-2 transition-all ${
          currentTurn === 'black' && isValidBearOff
            ? 'bg-emerald-950/60 border-emerald-400 ring-4 ring-emerald-400/50 animate-pulse cursor-pointer shadow-xl shadow-emerald-500/30'
            : 'bg-stone-950/60 border-amber-900/40'
        }`}
      >
        <div className="text-center">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 block">
            ⚫ SİYAH EVİ
          </span>
          <span className="text-[9px] text-stone-400 font-medium">
            (19-24 Toplama)
          </span>
        </div>

        {/* Borne-off Count and Mini Checkers representation */}
        <div className="flex flex-col items-center my-1">
          <div className="text-2xl sm:text-3xl font-black text-white font-mono drop-shadow">
            {borneOff.black} <span className="text-xs text-stone-400 font-normal">/15</span>
          </div>
          {borneOff.black > 0 && (
            <div className="flex -space-x-2 mt-1">
              {Array.from({ length: Math.min(borneOff.black, 4) }).map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-stone-950 border border-amber-600 shadow" />
              ))}
            </div>
          )}
        </div>

        {currentTurn === 'black' && isValidBearOff ? (
          <div className="w-full py-1 rounded-lg bg-emerald-500 text-stone-950 font-black text-[11px] flex items-center justify-center gap-1 shadow-lg animate-bounce">
            <Download className="w-3.5 h-3.5" /> TOPLA!
          </div>
        ) : (
          <span className="text-[9px] text-stone-500 uppercase font-bold">Hedef: 15</span>
        )}
      </div>

      {/* Tray Wooden Divider & Inlay */}
      <div className="h-1 bg-gradient-to-r from-amber-900/30 via-amber-500/50 to-amber-900/30 my-3 rounded-full" />

      {/* White Bear-Off Slot (Bottom) */}
      <div
        onClick={currentTurn === 'white' && isValidBearOff ? onBearOff : undefined}
        className={`flex-1 max-h-[220px] rounded-2xl border-2 flex flex-col items-center justify-between p-2 transition-all ${
          currentTurn === 'white' && isValidBearOff
            ? 'bg-emerald-950/60 border-emerald-400 ring-4 ring-emerald-400/50 animate-pulse cursor-pointer shadow-xl shadow-emerald-500/30'
            : 'bg-stone-950/60 border-amber-900/40'
        }`}
      >
        {currentTurn === 'white' && isValidBearOff ? (
          <div className="w-full py-1 rounded-lg bg-emerald-500 text-stone-950 font-black text-[11px] flex items-center justify-center gap-1 shadow-lg animate-bounce">
            <Download className="w-3.5 h-3.5" /> TOPLA!
          </div>
        ) : (
          <span className="text-[9px] text-stone-500 uppercase font-bold">Hedef: 15</span>
        )}

        {/* Borne-off Count and Mini Checkers representation */}
        <div className="flex flex-col items-center my-1">
          {borneOff.white > 0 && (
            <div className="flex -space-x-2 mb-1">
              {Array.from({ length: Math.min(borneOff.white, 4) }).map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-amber-100 border border-amber-500 shadow" />
              ))}
            </div>
          )}
          <div className="text-2xl sm:text-3xl font-black text-amber-200 font-mono drop-shadow">
            {borneOff.white} <span className="text-xs text-stone-400 font-normal">/15</span>
          </div>
        </div>

        <div className="text-center">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 block">
            ⚪ BEYAZ EVİ
          </span>
          <span className="text-[9px] text-stone-400 font-medium">
            (1-6 Toplama)
          </span>
        </div>
      </div>
    </div>
  );
};
