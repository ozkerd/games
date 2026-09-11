import React from 'react';
import { BoardPoint, PlayerColor } from '../../games/tavla/types';
import { TavlaPoint } from './TavlaPoint';
import { TavlaBar, TavlaTray } from './TavlaBarAndTray';

interface TavlaBoardProps {
  points: BoardPoint[];
  bar: Record<PlayerColor, number>;
  borneOff: Record<PlayerColor, number>;
  currentTurn: PlayerColor;
  selectedPoint: number | 'bar' | null;
  validDestinations: Array<number | 'off'>;
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
  onSelectPoint,
  onMoveTo,
}) => {
  // Top row left: points 13 to 18
  const topRowLeft = points.slice(12, 18);
  // Top row right: points 19 to 24
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
  // Bottom row right: points 6 down to 1
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

  const renderPoint = (pt: BoardPoint, isTopRow: boolean) => {
    const isSelected = selectedPoint === pt.index;
    const isValidDest = validDestinations.includes(pt.index);
    // Can select if it has current player's pieces and bar is clear (or selecting bar)
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
      {/* Outer Luxury Walnut Wood Frame with Brass Corner Accents */}
      <div className="relative rounded-3xl p-3 sm:p-5 md:p-6 bg-gradient-to-br from-[#4a2b18] via-[#331c0e] to-[#1c0e06] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-4px_8px_rgba(0,0,0,0.8)] border-4 border-[#5e381f]">
        {/* Brass Corner 1: Top-Left */}
        <div className="absolute top-2 left-2 w-7 h-7 border-t-2 border-l-2 border-amber-400/80 rounded-tl-xl pointer-events-none flex items-start justify-start p-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
        </div>
        {/* Brass Corner 2: Top-Right */}
        <div className="absolute top-2 right-2 w-7 h-7 border-t-2 border-r-2 border-amber-400/80 rounded-tr-xl pointer-events-none flex items-start justify-end p-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
        </div>
        {/* Brass Corner 3: Bottom-Left */}
        <div className="absolute bottom-2 left-2 w-7 h-7 border-b-2 border-l-2 border-amber-400/80 rounded-bl-xl pointer-events-none flex items-end justify-start p-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
        </div>
        {/* Brass Corner 4: Bottom-Right */}
        <div className="absolute bottom-2 right-2 w-7 h-7 border-b-2 border-r-2 border-amber-400/80 rounded-br-xl pointer-events-none flex items-end justify-end p-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
        </div>

        {/* Inner Marquetry Inlay Board Container */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#2b170c] via-[#3d2212] to-[#2b170c] border-2 border-[#54331b] shadow-inner flex flex-row min-h-[480px] sm:min-h-[560px] md:min-h-[620px]">
          {/* Main Play Area (Left Quad + Bar + Right Quad) */}
          <div className="flex-1 flex flex-col justify-between">
            {/* TOP ROW (Points 13 to 24) */}
            <div className="flex-1 flex border-b-2 border-[#502e17]/80">
              {/* Top Left Quad: Points 13 - 18 */}
              <div className="flex-1 flex">
                {topRowLeft.map((pt) => renderPoint(pt, true))}
              </div>

              {/* Central Wooden Bar (Top half) */}
              <div className="w-10 sm:w-14 md:w-16 h-full flex-shrink-0">
                {/* Embedded in full-height Bar component below */}
              </div>

              {/* Top Right Quad: Points 19 - 24 */}
              <div className="flex-1 flex">
                {topRowRight.map((pt) => renderPoint(pt, true))}
              </div>
            </div>

            {/* BOTTOM ROW (Points 12 down to 1) */}
            <div className="flex-1 flex border-t-2 border-[#502e17]/80">
              {/* Bottom Left Quad: Points 12 - 7 */}
              <div className="flex-1 flex">
                {bottomRowLeft.map((pt) => renderPoint(pt, false))}
              </div>

              {/* Central Wooden Bar (Bottom half) */}
              <div className="w-10 sm:w-14 md:w-16 h-full flex-shrink-0">
                {/* Embedded in full-height Bar component below */}
              </div>

              {/* Bottom Right Quad: Points 6 - 1 */}
              <div className="flex-1 flex">
                {bottomRowRight.map((pt) => renderPoint(pt, false))}
              </div>
            </div>

            {/* FULL-HEIGHT ABSOLUTE CENTER BAR */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
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
      </div>
    </div>
  );
};
