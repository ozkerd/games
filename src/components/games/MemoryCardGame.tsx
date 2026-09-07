import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameMode } from '../../types';
import { Users, Cpu, Trophy, RotateCcw, LayoutGrid, Brain, Sparkles } from 'lucide-react';

interface MemoryCardGameProps {
  player1Name: string;
  player2Name: string;
  onGameOver: (winner: 'player1' | 'player2' | 'draw') => void;
  onBackToHub: () => void;
}

const EMOJI_POOL = ['🚀', '💎', '🍕', '🎸', '🎮', '🦄', '⚡', '🎨', '🏆', '🍉', '🍿', '🔑'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryCardGame: React.FC<MemoryCardGameProps> = ({
  player1Name,
  player2Name,
  onGameOver,
  onBackToHub,
}) => {
  const [gameMode, setGameMode] = useState<GameMode>('vs_player');
  const [stage, setStage] = useState<'setup' | 'playing' | 'gameover'>('setup');
  const [pairCount, setPairCount] = useState<number>(8); // 8 pairs = 16 cards, 12 pairs = 24 cards
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [scores, setScores] = useState<{ player1: number; player2: number }>({ player1: 0, player2: 0 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [aiMemory, setAiMemory] = useState<Record<number, string>>({}); // AI remembered cards {index: emoji}

  const effectiveP2Name = gameMode === 'vs_ai' ? 'Memory AI 🤖' : player2Name;

  // Initialize deck
  const handleStartGame = () => {
    const selectedEmojis = EMOJI_POOL.slice(0, pairCount);
    const deckEmojis = [...selectedEmojis, ...selectedEmojis];
    // Shuffle
    const shuffled = deckEmojis
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffled);
    setFlippedIndices([]);
    setCurrentTurn(1);
    setScores({ player1: 0, player2: 0 });
    setIsProcessing(false);
    setAiMemory({});
    setStage('playing');
  };

  // Flip card handler
  const flipCard = useCallback((index: number) => {
    if (stage !== 'playing' || isProcessing) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndices.length >= 2) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    // Track in AI memory
    setAiMemory((prev) => ({ ...prev, [index]: newCards[index].emoji }));

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [firstIdx, secondIdx] = newFlipped;

      if (newCards[firstIdx].emoji === newCards[secondIdx].emoji) {
        // MATCH!
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setIsProcessing(false);

          const activePlayer = currentTurn === 1 ? 'player1' : 'player2';
          const updatedScores = {
            ...scores,
            [activePlayer]: scores[activePlayer] + 1,
          };
          setScores(updatedScores);

          // Check if all cards matched
          if (matchedCards.every((c) => c.isMatched)) {
            let winPlayer: 'player1' | 'player2' | 'draw' = 'draw';
            if (updatedScores.player1 > updatedScores.player2) winPlayer = 'player1';
            else if (updatedScores.player2 > updatedScores.player1) winPlayer = 'player2';

            setStage('gameover');
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
            onGameOver(winPlayer);
          }
        }, 600);
      } else {
        // NO MATCH -> Flip back & switch turn
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
          setIsProcessing(false);
          setCurrentTurn((prev) => (prev === 1 ? 2 : 1));
        }, 1100);
      }
    }
  }, [stage, isProcessing, cards, flippedIndices, currentTurn, scores, onGameOver]);

  // AI Move Logic
  useEffect(() => {
    if (stage === 'playing' && gameMode === 'vs_ai' && currentTurn === 2 && !isProcessing) {
      if (flippedIndices.length === 0) {
        // AI FIRST PICK
        // Check if AI knows a matching pair in memory
        const knownPairs: [number, number][] = [];
        const seenMap: Record<string, number[]> = {};

        Object.entries(aiMemory).forEach(([idxStr, emoji]) => {
          const idx = parseInt(idxStr);
          if (!cards[idx]?.isMatched) {
            if (!seenMap[emoji]) seenMap[emoji] = [];
            seenMap[emoji].push(idx);
          }
        });

        Object.values(seenMap).forEach((indices) => {
          if (indices.length >= 2) {
            knownPairs.push([indices[0], indices[1]]);
          }
        });

        let firstPick = -1;
        if (knownPairs.length > 0) {
          firstPick = knownPairs[0][0];
        } else {
          // Pick a random unrevealed card
          const available = cards
            .map((c, i) => (!c.isMatched && !c.isFlipped ? i : -1))
            .filter((i) => i !== -1);
          if (available.length > 0) {
            firstPick = available[Math.floor(Math.random() * available.length)];
          }
        }

        if (firstPick !== -1) {
          const timer = setTimeout(() => {
            flipCard(firstPick);
          }, 700);
          return () => clearTimeout(timer);
        }
      } else if (flippedIndices.length === 1) {
        // AI SECOND PICK
        const firstIdx = flippedIndices[0];
        const firstEmoji = cards[firstIdx].emoji;

        // Check if AI remembers the matching card for firstEmoji
        let secondPick = -1;
        Object.entries(aiMemory).forEach(([idxStr, emoji]) => {
          const idx = parseInt(idxStr);
          if (idx !== firstIdx && emoji === firstEmoji && !cards[idx]?.isMatched) {
            secondPick = idx;
          }
        });

        if (secondPick === -1) {
          // Pick random unrevealed card
          const available = cards
            .map((c, i) => (!c.isMatched && !c.isFlipped && i !== firstIdx ? i : -1))
            .filter((i) => i !== -1);
          if (available.length > 0) {
            secondPick = available[Math.floor(Math.random() * available.length)];
          }
        }

        if (secondPick !== -1) {
          const timer = setTimeout(() => {
            flipCard(secondPick);
          }, 800);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [stage, gameMode, currentTurn, isProcessing, flippedIndices, cards, aiMemory, flipCard]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* SETUP STAGE */}
      {stage === 'setup' && (
        <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-purple-400 uppercase">
                Memory Card Arcade
              </span>
              <h2 className="font-display text-2xl font-bold text-white">
                Match Setup
              </h2>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Game Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGameMode('vs_player')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  gameMode === 'vs_player'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold text-sm">2 Players</span>
                </div>
                <p className="text-xs text-slate-400">Share same screen with a friend</p>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('vs_ai')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  gameMode === 'vs_ai'
                    ? 'bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  <span className="font-bold text-sm">1 Player vs AI</span>
                </div>
                <p className="text-xs text-slate-400">Play against Memory AI</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Grid Size
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPairCount(8)}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                  pairCount === 8
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                16 Cards (8 Pairs)
              </button>
              <button
                type="button"
                onClick={() => setPairCount(12)}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                  pairCount === 12
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                24 Cards (12 Pairs)
              </button>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 text-white font-display font-bold text-lg hover:from-purple-600 hover:to-indigo-700 shadow-xl shadow-purple-600/25 transition-all"
          >
            Start Memory Duel
          </button>
        </div>
      )}

      {/* PLAYING / GAMEOVER ARENA */}
      {(stage === 'playing' || stage === 'gameover') && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-base">Memory Card Duel</h3>
                <p className="text-xs text-slate-400">Match card pairs to score points!</p>
              </div>
            </div>

            {/* Score Tracker */}
            <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-sm">
              <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                <span>{player1Name}:</span>
                <span className="font-mono text-white font-bold text-base">{scores.player1}</span>
              </div>
              <span className="text-slate-600 font-bold">:</span>
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                <span>{effectiveP2Name}:</span>
                <span className="font-mono text-white font-bold text-base">{scores.player2}</span>
              </div>
            </div>

            {/* Turn Indicator */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className={`font-display text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                currentTurn === 1
                  ? 'bg-indigo-600 text-white'
                  : 'bg-purple-600 text-white'
              }`}>
                {currentTurn === 1 ? player1Name : effectiveP2Name}'s Turn
              </span>
            </div>
          </div>

          {/* CARDS GRID */}
          <div className={`grid gap-3 sm:gap-4 max-w-2xl mx-auto p-4 bg-slate-900/60 border border-slate-800 rounded-3xl ${
            pairCount === 8 ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-6'
          }`}>
            {cards.map((card, idx) => (
              <button
                key={card.id}
                onClick={() => flipCard(idx)}
                disabled={card.isFlipped || card.isMatched || isProcessing || (gameMode === 'vs_ai' && currentTurn === 2)}
                className={`h-20 sm:h-24 rounded-2xl font-mono text-3xl sm:text-4xl flex items-center justify-center transition-all duration-300 transform perspective-500 ${
                  card.isFlipped || card.isMatched
                    ? 'bg-gradient-to-br from-indigo-900 to-purple-950 border-2 border-indigo-500 text-white scale-100'
                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-transparent hover:scale-105 active:scale-95 shadow-lg'
                } ${card.isMatched ? 'opacity-60 border-emerald-500' : ''}`}
              >
                {card.isFlipped || card.isMatched ? card.emoji : '❓'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GAMEOVER MODAL */}
      {stage === 'gameover' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg animate-fadeIn">
          <div className="w-full max-w-lg p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-purple-400 glow-emerald animate-bounce">
                <Trophy className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">
                Memory Card Duel Finished!
              </span>
              <h2 className="font-display text-3xl font-extrabold text-white">
                {scores.player1 === scores.player2
                  ? "It's a Tie! 🤝"
                  : `${scores.player1 > scores.player2 ? player1Name : effectiveP2Name} Wins! 🎉`}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="block text-slate-400 font-semibold mb-0.5">{player1Name} Pairs</span>
                <span className="font-mono font-bold text-indigo-400 text-lg">{scores.player1}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="block text-slate-400 font-semibold mb-0.5">{effectiveP2Name} Pairs</span>
                <span className="font-mono font-bold text-purple-400 text-lg">{scores.player2}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleStartGame}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 text-white font-display font-bold text-base hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Play Next Memory Match
              </button>

              <button
                onClick={onBackToHub}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                Return to Games Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
