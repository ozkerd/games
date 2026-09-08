import React from 'react';
import { OkeyGameState } from '../../games/okey/types';
import { OkeyTile } from './OkeyTile';
import { isRealOkey } from '../../games/okey/engine';
import { User, Bot, Sparkles, Layers } from 'lucide-react';

interface OkeyTableProps {
  state: OkeyGameState;
  myPlayerIndex: number;
  onDrawDeck: () => void;
  onDrawDiscard: () => void;
  onSelectDiscardForPlacement?: (slotIdx: number) => void;
}

export const OkeyTable: React.FC<OkeyTableProps> = ({
  state,
  myPlayerIndex,
  onDrawDeck,
  onDrawDiscard,
}) => {
  const isMyTurn = state.currentTurn === myPlayerIndex;
  const canDraw = isMyTurn && state.turnPhase === 'draw';

  // In standard Okey, you draw discard from the player to your right (previous turn)
  const prevPlayerIdx = (myPlayerIndex - 1 + state.playerCount) % state.playerCount;
  const rightDiscardPile = state.discardPiles[prevPlayerIdx] || [];
  const topDiscardFromRight = rightDiscardPile.length > 0 ? rightDiscardPile[rightDiscardPile.length - 1] : null;

  return (
    <div
      className="relative w-full max-w-5xl mx-auto rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-amber-900/60 overflow-hidden"
      style={{
        // Authentic Casino Green Velvet Felt gradient
        background: 'radial-gradient(ellipse at center, #065f46 0%, #064e3b 50%, #022c22 100%)',
        boxShadow: 'inset 0 0 60px rgba(0, 0, 0, 0.7), 0 20px 30px -10px rgba(0,0,0,0.8)',
      }}
    >
      {/* Table Felt Subtle Texture Border */}
      <div className="absolute inset-2 rounded-2xl border border-emerald-400/10 pointer-events-none" />

      {/* TOP / RIVAL PLAYERS AREA */}
      <div className="flex justify-between items-center mb-4 px-4">
        {/* If 4 players: Top-Left player */}
        {state.playerCount === 4 && (
          <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-800/40 p-2 rounded-2xl">
            <div className={`p-2 rounded-xl ${state.currentTurn === 3 ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-300'}`}>
              {state.players[3].isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-xs font-bold text-white block">{state.players[3].name}</span>
              <span className="text-[10px] text-emerald-300">
                {state.players[3].tiles.filter(Boolean).length} Taş
              </span>
            </div>
          </div>
        )}

        {/* Top-Center Player (Rival in 2P, or Player 3 in 4P) */}
        <div className="mx-auto flex items-center gap-2 bg-emerald-950/80 border border-emerald-800/50 p-2.5 rounded-2xl shadow-lg">
          <div className={`p-2 rounded-xl ${state.currentTurn === (state.playerCount === 2 ? 1 : 2) ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-300'}`}>
            {state.players[state.playerCount === 2 ? 1 : 2].isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-white">
                {state.players[state.playerCount === 2 ? 1 : 2].name}
              </span>
              {state.currentTurn === (state.playerCount === 2 ? 1 : 2) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold uppercase">
                  Sıra
                </span>
              )}
            </div>
            <span className="text-[11px] text-emerald-300">
              {state.players[state.playerCount === 2 ? 1 : 2].tiles.filter(Boolean).length} Taş
            </span>
          </div>
        </div>

        {/* If 4 players: Top-Right player */}
        {state.playerCount === 4 && (
          <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-800/40 p-2 rounded-2xl">
            <div className={`p-2 rounded-xl ${state.currentTurn === 1 ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-300'}`}>
              {state.players[1].isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-xs font-bold text-white block">{state.players[1].name}</span>
              <span className="text-[10px] text-emerald-300">
                {state.players[1].tiles.filter(Boolean).length} Taş
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CENTER TABLE: DECK, INDICATOR & DISCARD TRAYS */}
      <div className="my-6 flex flex-wrap items-center justify-around gap-6 p-4 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm">
        {/* Left Side: Right player discard (you can draw this!) */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
            Yandan Çekilecek Taş
          </span>
          <div
            onClick={canDraw && topDiscardFromRight ? onDrawDiscard : undefined}
            className={`p-2 rounded-xl border-2 transition-all ${
              canDraw && topDiscardFromRight
                ? 'border-amber-400 bg-amber-950/40 hover:scale-105 cursor-pointer shadow-lg shadow-amber-500/20'
                : 'border-emerald-900/60 bg-emerald-950/30'
            }`}
          >
            {topDiscardFromRight ? (
              <OkeyTile
                tile={topDiscardFromRight}
                isOkey={isRealOkey(topDiscardFromRight, state.okeyTile)}
                size="md"
              />
            ) : (
              <div className="w-10 h-14 rounded-lg border border-dashed border-emerald-800/60 flex items-center justify-center text-xs text-emerald-600">
                Boş
              </div>
            )}
          </div>
          {canDraw && topDiscardFromRight && (
            <span className="text-[10px] font-bold text-amber-300 animate-pulse">
              Tıkla ve Al
            </span>
          )}
        </div>

        {/* Center: DRAW DECK (Ortadaki Kapalı Taşlar) */}
        <div className="flex flex-col items-center gap-1.5">
          <div
            onClick={canDraw && state.deck.length > 0 ? onDrawDeck : undefined}
            className={`relative group p-2.5 rounded-2xl border-2 transition-all ${
              canDraw && state.deck.length > 0
                ? 'border-amber-400 bg-amber-950/50 hover:scale-105 cursor-pointer shadow-xl shadow-amber-500/30'
                : 'border-amber-900/60 bg-amber-950/30'
            }`}
          >
            {/* 3D Tile Stack Representation */}
            <div
              className="w-12 h-16 sm:w-14 sm:h-20 rounded-xl flex flex-col items-center justify-center font-display font-extrabold text-amber-200 border border-amber-600/60 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
              }}
            >
              <Layers className="w-5 h-5 text-amber-400 mb-1" />
              <span className="text-xs font-mono font-bold">{state.deck.length}</span>
              <span className="text-[9px] uppercase tracking-tighter text-amber-400/80">Taş</span>
            </div>

            {canDraw && state.deck.length > 0 && (
              <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-md animate-bounce">
                Çek!
              </div>
            )}
          </div>
          <span className="text-xs font-semibold text-emerald-200">
            {canDraw ? 'Ortadan Taş Çek' : 'Ortadaki Deste'}
          </span>
        </div>

        {/* Right Side: GÖSTERGE & OKEY BİLGİSİ */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" /> Gösterge & Okey
          </div>
          <div className="p-2 rounded-xl border border-amber-500/30 bg-amber-950/30 shadow-md">
            <OkeyTile tile={state.indicator} size="md" />
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold">
            <span>Okey:</span>
            <span
              className={`capitalize font-black ${
                state.okeyTile.color === 'red'
                  ? 'text-rose-400'
                  : state.okeyTile.color === 'yellow'
                  ? 'text-amber-400'
                  : state.okeyTile.color === 'blue'
                  ? 'text-blue-400'
                  : 'text-white'
              }`}
            >
              {state.okeyTile.color} {state.okeyTile.number}
            </span>
          </div>
        </div>
      </div>

      {/* 101 OKEY: OPENED SETS TABLE AREA */}
      {state.variant === '101' && state.openedSets.length > 0 && (
        <div className="my-4 p-3 rounded-2xl bg-black/30 border border-emerald-500/20 max-h-36 overflow-y-auto">
          <span className="text-xs font-bold text-emerald-300 block mb-2">
            Masaya Açılan Perler (101):
          </span>
          <div className="flex flex-wrap gap-4">
            {state.openedSets.map((meldItem, mIdx) => (
              <div key={mIdx} className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-700/40">
                <span className="text-[10px] text-emerald-400 font-semibold block mb-1">
                  {meldItem.playerName}
                </span>
                <div className="flex gap-1">
                  {meldItem.tiles.map((t, tIdx) => (
                    <OkeyTile key={tIdx} tile={t} size="sm" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM INFO: My status banner */}
      <div className="flex items-center justify-between px-2 pt-2 border-t border-emerald-800/40 text-xs">
        <div className="flex items-center gap-2 text-emerald-200 font-medium">
          <span>Oyun Türü:</span>
          <strong className="text-amber-300 uppercase font-bold">
            {state.variant === '101' ? '101 Okey' : 'Düz Okey'} ({state.playerCount} Kişi)
          </strong>
        </div>

        <div className="flex items-center gap-2">
          {isMyTurn ? (
            <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-md animate-pulse">
              🎯 Senin Sıran: {state.turnPhase === 'draw' ? 'Taş Çek!' : 'Taş At!'}
            </span>
          ) : (
            <span className="text-emerald-400/80">
              Sıradaki: <strong>{state.players[state.currentTurn].name}</strong> düşünüyor...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
