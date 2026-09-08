import React, { useState } from 'react';
import { Tile, TileColor } from '../../games/okey/types';
import { OkeyTile } from './OkeyTile';
import { isRealOkey } from '../../games/okey/engine';
import { ArrowUpDown, Layers, ArrowDownCircle, CheckCircle2 } from 'lucide-react';

interface OkeyRackProps {
  tiles: (Tile | null)[];
  okeyTile: { color: TileColor; number: number };
  isMyTurn: boolean;
  canDiscard: boolean;
  canOpen101?: boolean;
  onMoveTile: (fromIndex: number, toIndex: number) => void;
  onDiscardTile: (slotIndex: number) => void;
  onSortSeries: () => void;
  onSortPairs: () => void;
  onOpen101?: () => void;
  onFinishHand?: (slotIndex: number) => void;
}

export const OkeyRack: React.FC<OkeyRackProps> = ({
  tiles,
  okeyTile,
  isMyTurn,
  canDiscard,
  canOpen101 = false,
  onMoveTile,
  onDiscardTile,
  onSortSeries,
  onSortPairs,
  onOpen101,
  onFinishHand,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const upperRow = tiles.slice(0, 15);
  const lowerRow = tiles.slice(15, 30);

  const handleSlotClick = (slotIdx: number) => {
    if (selectedIndex === null) {
      if (tiles[slotIdx]) {
        setSelectedIndex(slotIdx);
      }
    } else {
      if (selectedIndex === slotIdx) {
        setSelectedIndex(null); // unselect
      } else {
        onMoveTile(selectedIndex, slotIdx);
        setSelectedIndex(null);
      }
    }
  };

  const handleDragStart = (slotIdx: number) => {
    setDraggedIndex(slotIdx);
  };

  const handleDrop = (targetIdx: number) => {
    if (draggedIndex !== null && draggedIndex !== targetIdx) {
      onMoveTile(draggedIndex, targetIdx);
    }
    setDraggedIndex(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto select-none">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onSortSeries}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800/80 text-amber-200 text-xs font-semibold shadow-md transition-all active:scale-95"
            title="Kelimeleri ve serileri otomatik diz"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Seri Diz
          </button>
          <button
            onClick={onSortPairs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800/80 text-amber-200 text-xs font-semibold shadow-md transition-all active:scale-95"
            title="Çiftleri yan yana diz"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            Çift Diz
          </button>
        </div>

        {/* Turn & Action Buttons */}
        <div className="flex items-center gap-2">
          {canOpen101 && onOpen101 && (
            <button
              onClick={onOpen101}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 animate-pulse transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Elini Aç (101)
            </button>
          )}

          {canDiscard && selectedIndex !== null && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onDiscardTile(selectedIndex);
                  setSelectedIndex(null);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-extrabold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
              >
                <ArrowDownCircle className="w-4 h-4" />
                Seçili Taşı At
              </button>

              {onFinishHand && (
                <button
                  onClick={() => {
                    onFinishHand(selectedIndex);
                    setSelectedIndex(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 text-white text-xs font-extrabold shadow-lg shadow-amber-500/30 hover:brightness-110 transition-all active:scale-95"
                >
                  🏆 Bitti / Okey At!
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* REALISTIC WOODEN ISTAKA (CUE RACK) */}
      <div
        className={`relative p-3 sm:p-4 rounded-3xl shadow-2xl border-2 border-amber-900/80 transition-all ${
          isMyTurn ? 'ring-2 ring-amber-500/60 shadow-amber-900/40' : ''
        }`}
        style={{
          // Wooden Cue rich grain gradient
          background: 'linear-gradient(180deg, #78350f 0%, #5b280c 40%, #451a03 100%)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(251, 191, 36, 0.2), inset 0 -3px 6px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Wood End Caps Accent */}
        <div className="absolute left-2 top-3 bottom-3 w-1.5 rounded bg-amber-950/80 border-r border-amber-700/30" />
        <div className="absolute right-2 top-3 bottom-3 w-1.5 rounded bg-amber-950/80 border-l border-amber-700/30" />

        <div className="space-y-2 sm:space-y-2.5 px-2">
          {/* UPPER TIER (15 slots) */}
          <div
            className="flex items-center justify-between gap-1 sm:gap-1.5 p-1.5 rounded-xl bg-amber-950/60 border border-amber-900/60 shadow-inner overflow-x-auto"
            style={{ minHeight: '3.5rem' }}
          >
            {upperRow.map((tile, i) => {
              const slotIdx = i;
              return (
                <OkeyTile
                  key={`slot-${slotIdx}`}
                  tile={tile}
                  isOkey={tile ? isRealOkey(tile, okeyTile) : false}
                  isSelected={selectedIndex === slotIdx}
                  size="md"
                  onClick={() => handleSlotClick(slotIdx)}
                  draggable={!!tile}
                  onDragStart={() => handleDragStart(slotIdx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(slotIdx)}
                />
              );
            })}
          </div>

          {/* LOWER TIER (15 slots) */}
          <div
            className="flex items-center justify-between gap-1 sm:gap-1.5 p-1.5 rounded-xl bg-amber-950/60 border border-amber-900/60 shadow-inner overflow-x-auto"
            style={{ minHeight: '3.5rem' }}
          >
            {lowerRow.map((tile, i) => {
              const slotIdx = i + 15;
              return (
                <OkeyTile
                  key={`slot-${slotIdx}`}
                  tile={tile}
                  isOkey={tile ? isRealOkey(tile, okeyTile) : false}
                  isSelected={selectedIndex === slotIdx}
                  size="md"
                  onClick={() => handleSlotClick(slotIdx)}
                  draggable={!!tile}
                  onDragStart={() => handleDragStart(slotIdx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(slotIdx)}
                />
              );
            })}
          </div>
        </div>

        {/* Routed Cue Bottom Shelf Shadow */}
        <div className="h-1.5 mt-2 rounded bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 opacity-90" />
      </div>

      {/* Helper text */}
      <p className="text-[11px] text-slate-400 text-center mt-1.5">
        Taşı seçip başka yuvaya tıklayarak yerini değiştirebilirsiniz. Sıranızda taşı seçip <strong>"Seçili Taşı At"</strong> veya <strong>"Bitti"</strong> diyebilirsiniz.
      </p>
    </div>
  );
};
