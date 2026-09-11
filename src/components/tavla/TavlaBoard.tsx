import React from 'react';
import { BoardPoint, PlayerColor } from '../../games/tavla/types';
import { TavlaPoint } from './TavlaPoint';
import { TavlaBar, TavlaTray } from './TavlaBarAndTray';
import { DieFace } from './TavlaDice';

interface TavlaBoardProps {
  points: BoardPoint[];
  bar: Record<PlayerColor, number>;
  borneOff: Record<PlayerColor, number>;
  currentTurn: PlayerColor;
  selectedPoint: number | 'bar' | null;
  validDestinations: Array<number | 'off'>;
  dice: [number, number];
  remainingMoves: number[];
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  onSelectPoint: (pointIndex: number | 'bar') => void;
  onMoveTo: (target: number | 'off') => void;
}

export const TavlaBoard: React.FC<TavlaBoardProps> = ({
  points,
  bar,
  borneOff,
  currentTurn,
  selectedPoint,
  validDestinations,
  dice,
  remainingMoves,
  isRolling,
  canRoll,
  onRoll,
  onSelectPoint,
  onMoveTo,
}) => {
  // Top row left: points 13 to 18
  const topRowLeft = points.slice(12, 18);
  // Top row right: points 19 to 24 (Black's Home Board)
  const topRowRight = points.slice(18, 24);

  // Bottom row left: points 12 down to 7
  const bottomRowLeft = [
    points[11],
    points[10],
    points[9],
    points[8],
    points[7],
    points[6],
  ];
  // Bottom row right: points 6 down to 1 (White's Home Board)
  const bottomRowRight = [
    points[5],
    points[4],
    points[3],
    points[2],
    points[1],
    points[0],
  ];

  const canSelectBar = bar[currentTurn] > 0;
  const isValidBearOff = validDestinations.includes('off');

  const [d1, d2] = dice;
  const d1CountInRemaining = remainingMoves.filter((m) => m === d1).length;
  const d2CountInRemaining = remainingMoves.filter((m) => m === d2).length;
  const d1Used = d1 > 0 && d1CountInRemaining === 0;
  const d2Used = d2 > 0 && d2CountInRemaining === 0 && d1 !== d2;

  const renderPoint = (pt: BoardPoint, isTopRow: boolean) => {
    const isSelected = selectedPoint === pt.index;
    const isValidDest = validDestinations.includes(pt.index);
    const canSelect =
      bar[currentTurn] === 0 && pt.color === currentTurn && pt.count > 0;

    return (
      <TavlaPoint
        key={pt.index}
        point={pt}
        isTopRow={isTopRow}
        isSelected={isSelected}
        isValidDestination={isValidDest}
        canSelect={canSelect}
        onSelect={() => onSelectPoint(pt.index)}
        onMoveTo={() => onMoveTo(pt.index)}
      />
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto select-none transition-all duration-300">
      {/* Outer Luxury Walnut Wood Frame */}
      <div className="relative rounded-3xl p-3 sm:p-5 md:p-6 bg-gradient-to-br from-[#4a2613] via-[#2f170b] to-[#170a04] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.25),inset_0_-4px_8px_rgba(0,0,0,0.85)] border-4 border-[#633a1e]">
        {/* Brass Corner 1: Top-Left */}
        <div className="absolute top-2.5 left-2.5 w-8 h-8 border-t-2 border-l-2 border-amber-400 rounded-tl-xl pointer-events-none flex items-start justify-start p-1">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
        </div>
        {/* Brass Corner 2: Top-Right */}
        <div className="absolute top-2.5 right-2.5 w-8 h-8 border-t-2 border-r-2 border-amber-400 rounded-tr-xl pointer-events-none flex items-start justify-end p-1">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
        </div>
        {/* Brass Corner 3: Bottom-Left */}
        <div className="absolute bottom-2.5 left-2.5 w-8 h-8 border-b-2 border-l-2 border-amber-400 rounded-bl-xl pointer-events-none flex items-end justify-start p-1">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
        </div>
        {/* Brass Corner 4: Bottom-Right */}
        <div className="absolute bottom-2.5 right-2.5 w-8 h-8 border-b-2 border-r-2 border-amber-400 rounded-br-xl pointer-events-none flex items-end justify-end p-1">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
        </div>

        {/* Board Top Edge Rail with Direction & Zone Clarifications */}
        <div className="flex items-center justify-between px-4 pb-2 text-[11px] font-bold text-amber-200/90">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-stone-900/90 border border-amber-900/60 text-amber-300">
              ⚫ Siyah Dış Bölge (13 - 18)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-stone-900 to-amber-950 border border-amber-500/60 text-amber-300 font-black shadow-md flex items-center gap-1.5 animate-pulse">
              ⚫ SİYAH EVİ (19 - 24) ➔ [TOPLAMA ALANI]
            </span>
          </div>
        </div>

        {/* Inner Marquetry Inlay Board Container */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#241208] via-[#3a1d0d] to-[#241208] border-2 border-[#522d16] shadow-[inset_0_0_30px_rgba(0,0,0,0.85)] flex flex-row min-h-[520px] sm:min-h-[580px] md:min-h-[640px]">
          {/* Main Play Area (Left Quad + Bar + Right Quad) */}
          <div className="flex-1 flex flex-col justify-between relative">
            {/* TOP ROW (Points 13 to 24) */}
            <div className="flex-1 flex border-b-2 border-[#472511]">
              {/* Top Left Quad: Points 13 - 18 */}
              <div className="flex-1 flex bg-[#281308]/60">
                {topRowLeft.map((pt) => renderPoint(pt, true))}
              </div>

              {/* Bar Spacer */}
              <div className="w-12 sm:w-16 md:w-18 h-full flex-shrink-0" />

              {/* Top Right Quad: Points 19 - 24 (Black's Home Board) */}
              <div className="flex-1 flex bg-[#2f170b]/60 border-l border-amber-900/20">
                {topRowRight.map((pt) => renderPoint(pt, true))}
              </div>
            </div>

            {/* ON-BOARD 3D ANIMATED DICE ARENA (Center Surface) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              {/* Throw Dice button on board if rollable */}
              {canRoll && (
                <div className="pointer-events-auto">
                  <button
                    onClick={onRoll}
                    disabled={isRolling}
                    className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-base tracking-wider shadow-[0_10px_25px_rgba(245,158,11,0.6)] hover:shadow-[0_12px_30px_rgba(245,158,11,0.8)] active:scale-95 transition-all duration-200 cursor-pointer animate-pulse border-2 border-amber-200"
                  >
                    <span className="text-xl">🎲</span>
                    <span>ZAR AT</span>
                  </button>
                </div>
              )}

              {/* Active Dice Tumble onto the Board */}
              {(d1 > 0 || isRolling) && !canRoll && (
                <div
                  className={`pointer-events-auto flex items-center gap-5 p-3 rounded-2xl bg-stone-950/60 backdrop-blur-md border border-amber-600/40 shadow-2xl transition-all duration-300 ${
                    isRolling ? 'scale-125 animate-bounce' : 'scale-105'
                  }`}
                >
                  <DieFace value={d1 || 1} isRolling={isRolling} isUsed={d1Used} size="lg" />
                  <DieFace value={d2 || 1} isRolling={isRolling} isUsed={d2Used} size="lg" />
                </div>
              )}
            </div>

            {/* BOTTOM ROW (Points 12 down to 1) */}
            <div className="flex-1 flex border-t-2 border-[#472511]">
              {/* Bottom Left Quad: Points 12 - 7 */}
              <div className="flex-1 flex bg-[#281308]/60">
                {bottomRowLeft.map((pt) => renderPoint(pt, false))}
              </div>

              {/* Bar Spacer */}
              <div className="w-12 sm:w-16 md:w-18 h-full flex-shrink-0" />

              {/* Bottom Right Quad: Points 6 - 1 (White's Home Board) */}
              <div className="flex-1 flex bg-[#2f170b]/60 border-l border-amber-900/20">
                {bottomRowRight.map((pt) => renderPoint(pt, false))}
              </div>
            </div>

            {/* FULL-HEIGHT ABSOLUTE CENTER BAR */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto z-20">
              <TavlaBar
                bar={bar}
                selectedPoint={selectedPoint}
                currentTurn={currentTurn}
                canSelectBar={canSelectBar}
                onSelectBar={() => onSelectPoint('bar')}
              />
            </div>
          </div>

          {/* Right Edge: Bear-Off Collection Trays */}
          <TavlaTray
            borneOff={borneOff}
            isValidBearOff={isValidBearOff}
            currentTurn={currentTurn}
            onBearOff={() => onMoveTo('off')}
          />
        </div>

        {/* Board Bottom Edge Rail with Direction & Zone Clarifications */}
        <div className="flex items-center justify-between px-4 pt-2 text-[11px] font-bold text-amber-200/90">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-stone-900/90 border border-amber-900/60 text-amber-300">
              ⚪ Beyaz Dış Bölge (12 - 7)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-950 to-stone-900 border border-amber-500/60 text-amber-300 font-black shadow-md flex items-center gap-1.5 animate-pulse">
              ⚪ BEYAZ EVİ (6 - 1) ➔ [TOPLAMA ALANI]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
