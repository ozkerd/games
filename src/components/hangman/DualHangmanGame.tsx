import React, { useState, useEffect, useCallback } from 'react';
import { HangmanDrawing } from '../HangmanDrawing';
import { WORD_CATEGORIES, getRandomWord } from '../../data/wordBank';
import { DualHangmanState, GameMode } from '../../types';
import { Sparkles, Bot, Tag, Play, Users, User, Cpu } from 'lucide-react';

interface DualHangmanGameProps {
  player1Name: string;
  player2Name: string;
  onGameOver: (winner: 'player1' | 'player2', secretWord: string, p1Mistakes: number, p2Mistakes: number) => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// English letter frequency for smart AI moves
const LETTER_FREQUENCY = [
  'E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R', 'D', 'L', 'C', 'U',
  'M', 'W', 'F', 'G', 'Y', 'P', 'B', 'V', 'K', 'J', 'X', 'Q', 'Z'
];

export const DualHangmanGame: React.FC<DualHangmanGameProps> = ({
  player1Name,
  player2Name,
  onGameOver,
}) => {
  const [gameMode, setGameMode] = useState<GameMode>('vs_player');
  const [categorySelection, setCategorySelection] = useState('All Categories');
  const [maxMistakes, setMaxMistakes] = useState(6);

  const [gameState, setGameState] = useState<DualHangmanState>({
    stage: 'setup',
    gameMode: 'vs_player',
    secretWord: '',
    category: '',
    hint: '',
    maxMistakes: 6,
    player1Guesses: new Set<string>(),
    player2Guesses: new Set<string>(),
    currentTurn: 1,
    winner: null,
    player1Name,
    player2Name: gameMode === 'vs_ai' ? 'Computer AI 🤖' : player2Name,
  });

  const effectiveP2Name = gameMode === 'vs_ai' ? 'Computer AI 🤖' : player2Name;

  // Start match
  const handleStartMatch = () => {
    const selected = getRandomWord(categorySelection);
    setGameState({
      stage: 'playing',
      gameMode,
      secretWord: selected.word.toUpperCase(),
      category: selected.category,
      hint: selected.hint,
      maxMistakes,
      player1Guesses: new Set<string>(),
      player2Guesses: new Set<string>(),
      currentTurn: 1,
      winner: null,
      player1Name,
      player2Name: effectiveP2Name,
    });
  };

  // Core letter guessing logic
  const handleGuessLetter = useCallback((letter: string) => {
    if (gameState.stage !== 'playing') return;

    const upperLetter = letter.toUpperCase();
    const activePlayer = gameState.currentTurn;
    const currentGuesses = activePlayer === 1 ? gameState.player1Guesses : gameState.player2Guesses;

    if (currentGuesses.has(upperLetter)) return; // already guessed

    const nextGuesses = new Set(currentGuesses);
    nextGuesses.add(upperLetter);

    const isCorrect = gameState.secretWord.includes(upperLetter);

    const updatedP1Guesses = activePlayer === 1 ? nextGuesses : gameState.player1Guesses;
    const updatedP2Guesses = activePlayer === 2 ? nextGuesses : gameState.player2Guesses;

    // Check if active player completed the word
    const secretChars = gameState.secretWord
      .split('')
      .filter((char) => /^[A-Z]$/.test(char));
    const isWon = secretChars.every((char) => nextGuesses.has(char));

    // Calculate wrong count for active player
    const activeWrongCount = Array.from(nextGuesses).filter(
      (char) => !gameState.secretWord.includes(char)
    ).length;

    const isOut = activeWrongCount >= gameState.maxMistakes;

    if (isWon) {
      const winner = activePlayer === 1 ? 'player1' : 'player2';
      setGameState((prev) => ({
        ...prev,
        player1Guesses: updatedP1Guesses,
        player2Guesses: updatedP2Guesses,
        stage: 'gameover',
        winner,
      }));
      const p1Wrong = Array.from(updatedP1Guesses).filter((c) => !gameState.secretWord.includes(c)).length;
      const p2Wrong = Array.from(updatedP2Guesses).filter((c) => !gameState.secretWord.includes(c)).length;
      onGameOver(winner, gameState.secretWord, p1Wrong, p2Wrong);
    } else {
      let nextTurn = gameState.currentTurn;
      if (!isCorrect) {
        nextTurn = activePlayer === 1 ? 2 : 1;
      }

      const p1WrongCount = Array.from(updatedP1Guesses).filter((c) => !gameState.secretWord.includes(c)).length;
      const p2WrongCount = Array.from(updatedP2Guesses).filter((c) => !gameState.secretWord.includes(c)).length;

      if (p1WrongCount >= gameState.maxMistakes && p2WrongCount >= gameState.maxMistakes) {
        const winner = p1WrongCount <= p2WrongCount ? 'player1' : 'player2';
        setGameState((prev) => ({
          ...prev,
          player1Guesses: updatedP1Guesses,
          player2Guesses: updatedP2Guesses,
          stage: 'gameover',
          winner,
        }));
        onGameOver(winner, gameState.secretWord, p1WrongCount, p2WrongCount);
      } else if (isOut) {
        nextTurn = activePlayer === 1 ? 2 : 1;
        setGameState((prev) => ({
          ...prev,
          player1Guesses: updatedP1Guesses,
          player2Guesses: updatedP2Guesses,
          currentTurn: nextTurn,
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          player1Guesses: updatedP1Guesses,
          player2Guesses: updatedP2Guesses,
          currentTurn: nextTurn,
        }));
      }
    }
  }, [gameState, onGameOver]);

  // AUTOMATED AI PLAYER MOVE LOGIC
  useEffect(() => {
    if (
      gameState.stage === 'playing' &&
      gameState.gameMode === 'vs_ai' &&
      gameState.currentTurn === 2
    ) {
      // Pick best remaining letter from frequency list
      const remainingLetters = LETTER_FREQUENCY.filter(
        (letter) => !gameState.player2Guesses.has(letter)
      );

      if (remainingLetters.length > 0) {
        const aiPick = remainingLetters[0];

        const timer = setTimeout(() => {
          handleGuessLetter(aiPick);
        }, 900); // 900ms realistic delay for AI move

        return () => clearTimeout(timer);
      }
    }
  }, [gameState.stage, gameState.gameMode, gameState.currentTurn, gameState.player2Guesses, handleGuessLetter]);

  // Physical keyboard listener (only active on Player 1's turn if playing vs AI)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState.stage !== 'playing') return;
      if (gameState.gameMode === 'vs_ai' && gameState.currentTurn === 2) return; // ignore typing during AI turn

      const key = event.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        handleGuessLetter(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.stage, gameState.gameMode, gameState.currentTurn, handleGuessLetter]);

  // Helper to render letter slots
  const renderWordSlots = (word: string, guessedSet: Set<string>) => {
    return (
      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 my-4">
        {word.split('').map((char, index) => {
          const isAlpha = /^[A-Z]$/.test(char);
          const isRevealed = !isAlpha || guessedSet.has(char);
          return (
            <div
              key={index}
              className={`w-8 h-10 sm:w-10 sm:h-12 rounded-lg flex items-center justify-center font-mono text-xl sm:text-2xl font-bold border-2 transition-all ${
                isRevealed
                  ? 'border-indigo-500 bg-indigo-950/50 text-indigo-200'
                  : 'border-slate-800 bg-slate-950 text-transparent'
              }`}
            >
              {isRevealed ? char : ''}
            </div>
          );
        })}
      </div>
    );
  };

  const getPlayerWrongCount = (guesses: Set<string>) =>
    Array.from(guesses).filter((c) => !gameState.secretWord.includes(c)).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* SETUP STAGE */}
      {gameState.stage === 'setup' && (
        <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
                Match Configuration
              </span>
              <h2 className="font-display text-2xl font-bold text-white">
                Hangman Setup
              </h2>
            </div>
          </div>

          {/* Mode Selector */}
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
                <p className="text-xs text-slate-400">Share same keyboard with a friend</p>
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
                <p className="text-xs text-slate-400">Play solo against Computer AI</p>
              </button>
            </div>
          </div>

          {/* Word Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Word Category
            </label>
            <select
              value={categorySelection}
              onChange={(e) => setCategorySelection(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            >
              {WORD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Lives Limit */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Lives Per Player
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[4, 6, 8].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMaxMistakes(num)}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                    maxMistakes === num
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {num} Lives {num === 6 ? '(Standard)' : num === 4 ? '(Hard)' : '(Easy)'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartMatch}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white font-display font-bold text-lg hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            Start {gameMode === 'vs_ai' ? 'Solo Match vs AI' : '2-Player Battle'}
          </button>
        </div>
      )}

      {/* PLAYING STAGE */}
      {gameState.stage === 'playing' && (
        <div className="space-y-6">
          {/* Status & Turn Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400">Computer Secret Word</span>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-white text-base">
                    Category: {gameState.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Turn Indicator */}
            <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Current Turn:
              </span>
              <span className={`font-display text-sm font-extrabold px-3 py-1 rounded-lg ${
                gameState.currentTurn === 1
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 animate-pulse'
                  : 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 animate-pulse'
              }`}>
                {gameState.currentTurn === 1 ? player1Name : gameState.player2Name}
              </span>
            </div>

            {gameState.hint && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
                <Tag className="w-3.5 h-3.5" />
                Hint: {gameState.hint}
              </div>
            )}
          </div>

          {/* DUAL BOARDS SIDE-BY-SIDE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PLAYER 1 BOARD */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 ${
              gameState.currentTurn === 1
                ? 'bg-slate-900/95 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/30'
                : 'bg-slate-900/60 border-slate-800 opacity-80'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center text-sm">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white">{player1Name}</h4>
                    <span className="text-[11px] text-indigo-400 font-semibold">
                      {gameState.currentTurn === 1 ? '🎯 Active Turn' : 'Waiting...'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block uppercase font-semibold">Lives</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {gameState.maxMistakes - getPlayerWrongCount(gameState.player1Guesses)} / {gameState.maxMistakes}
                  </span>
                </div>
              </div>

              <div className="py-2 flex justify-center">
                <HangmanDrawing wrongGuessesCount={getPlayerWrongCount(gameState.player1Guesses)} />
              </div>

              {renderWordSlots(gameState.secretWord, gameState.player1Guesses)}

              <div className="text-center text-xs text-slate-400">
                <span>Wrong Guesses: </span>
                <span className="font-mono text-rose-400 font-bold">
                  {Array.from(gameState.player1Guesses)
                    .filter((c) => !gameState.secretWord.includes(c))
                    .join(', ') || 'None'}
                </span>
              </div>
            </div>

            {/* PLAYER 2 / AI BOARD */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 ${
              gameState.currentTurn === 2
                ? 'bg-slate-900/95 border-purple-500 shadow-xl shadow-purple-500/10 ring-2 ring-purple-500/30'
                : 'bg-slate-900/60 border-slate-800 opacity-80'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 font-bold flex items-center justify-center text-sm">
                    {gameState.gameMode === 'vs_ai' ? <Cpu className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white">{gameState.player2Name}</h4>
                    <span className="text-[11px] text-purple-400 font-semibold">
                      {gameState.currentTurn === 2
                        ? gameState.gameMode === 'vs_ai'
                          ? '🤖 AI Thinking...'
                          : '🎯 Active Turn'
                        : 'Waiting...'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block uppercase font-semibold">Lives</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {gameState.maxMistakes - getPlayerWrongCount(gameState.player2Guesses)} / {gameState.maxMistakes}
                  </span>
                </div>
              </div>

              <div className="py-2 flex justify-center">
                <HangmanDrawing wrongGuessesCount={getPlayerWrongCount(gameState.player2Guesses)} />
              </div>

              {renderWordSlots(gameState.secretWord, gameState.player2Guesses)}

              <div className="text-center text-xs text-slate-400">
                <span>Wrong Guesses: </span>
                <span className="font-mono text-rose-400 font-bold">
                  {Array.from(gameState.player2Guesses)
                    .filter((c) => !gameState.secretWord.includes(c))
                    .join(', ') || 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* SHARED KEYBOARD */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl backdrop-blur-md space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
              {gameState.currentTurn === 1
                ? `${player1Name}'s Turn:`
                : gameState.gameMode === 'vs_ai'
                ? '🤖 AI is making a move...'
                : `${gameState.player2Name}'s Turn:`}
            </p>

            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
              {ALPHABET.map((letter) => {
                const activeGuesses = gameState.currentTurn === 1 ? gameState.player1Guesses : gameState.player2Guesses;
                const isGuessedByActive = activeGuesses.has(letter);
                const isCorrect = isGuessedByActive && gameState.secretWord.includes(letter);
                const isWrong = isGuessedByActive && !gameState.secretWord.includes(letter);
                const isDisabled = isGuessedByActive || (gameState.gameMode === 'vs_ai' && gameState.currentTurn === 2);

                return (
                  <button
                    key={letter}
                    onClick={() => handleGuessLetter(letter)}
                    disabled={isDisabled}
                    className={`w-9 h-11 sm:w-11 sm:h-12 rounded-xl font-display text-base sm:text-lg font-bold uppercase transition-all duration-150 ${
                      isCorrect
                        ? 'bg-emerald-600 text-white border border-emerald-500 cursor-not-allowed scale-95 opacity-90'
                        : isWrong
                        ? 'bg-slate-900 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-40'
                        : isDisabled
                        ? 'bg-slate-900/50 text-slate-700 border border-slate-800 cursor-not-allowed'
                        : gameState.currentTurn === 1
                        ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 active:scale-95'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-purple-600 hover:text-white hover:border-purple-500 active:scale-95'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
