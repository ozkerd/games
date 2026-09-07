import React, { useEffect, useCallback } from 'react';
import { HangmanDrawing } from './HangmanDrawing';
import { Tag, AlertCircle, Sparkles } from 'lucide-react';

interface HangmanGameProps {
  secretWord: string;
  category: string;
  guessedLetters: Set<string>;
  maxMistakes: number;
  player1Name: string;
  player2Name: string;
  onGuessLetter: (letter: string) => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const HangmanGame: React.FC<HangmanGameProps> = ({
  secretWord,
  category,
  guessedLetters,
  maxMistakes,
  player1Name,
  player2Name,
  onGuessLetter,
}) => {
  // Count wrong guesses
  const wrongGuesses = Array.from(guessedLetters).filter(
    (letter) => !secretWord.includes(letter)
  );
  const wrongCount = wrongGuesses.length;
  const remainingLives = maxMistakes - wrongCount;

  // Keyboard handler for physical keyboard keypresses
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      if (/^[A-Z]$/.test(key) && !guessedLetters.has(key)) {
        onGuessLetter(key);
      }
    },
    [guessedLetters, onGuessLetter]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Check if character is revealed
  const isRevealed = (char: string) => {
    if (!/^[A-Z]$/.test(char)) return true; // spaces and punctuation always visible
    return guessedLetters.has(char);
  };

  // Group letters by word if secret word contains multiple words
  const words = secretWord.split(' ');

  return (
    <div className="max-w-4xl mx-auto my-6 space-y-6">
      {/* Top Banner: Turn info and status */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base">
              {player2Name}'s Turn to Guess!
            </h3>
            <p className="text-xs text-slate-400">
              Word set by <strong className="text-slate-300">{player1Name}</strong>
            </p>
          </div>
        </div>

        {category && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Tag className="w-3.5 h-3.5" />
            Hint: {category}
          </div>
        )}

        {/* Lives Counter */}
        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <AlertCircle className={`w-4 h-4 ${remainingLives <= 2 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Lives:
          </span>
          <span className={`font-mono text-base font-bold ${remainingLives <= 2 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {remainingLives} / {maxMistakes}
          </span>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Visual Hangman Drawing */}
        <div className="md:col-span-5 flex justify-center">
          <HangmanDrawing wrongGuessesCount={wrongCount} />
        </div>

        {/* Right Column: Secret Word Display & Keyboard */}
        <div className="md:col-span-7 space-y-8">
          {/* Secret Word Presentation */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
            {words.map((wordStr, wordIdx) => (
              <div key={wordIdx} className="flex gap-2">
                {wordStr.split('').map((char, charIdx) => {
                  const revealed = isRevealed(char);
                  return (
                    <div
                      key={charIdx}
                      className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl flex items-center justify-center font-mono text-2xl sm:text-3xl font-bold uppercase transition-all duration-200 border-2 ${
                        revealed
                          ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200 shadow-md shadow-indigo-500/10'
                          : 'border-slate-800 bg-slate-950 text-transparent'
                      }`}
                    >
                      {revealed ? char : ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* On-screen Keyboard */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
              Click a letter or use your physical keyboard
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
              {ALPHABET.map((letter) => {
                const isGuessed = guessedLetters.has(letter);
                const isCorrect = isGuessed && secretWord.includes(letter);
                const isWrong = isGuessed && !secretWord.includes(letter);

                return (
                  <button
                    key={letter}
                    onClick={() => onGuessLetter(letter)}
                    disabled={isGuessed}
                    className={`w-9 h-11 sm:w-11 sm:h-12 rounded-xl font-display text-base sm:text-lg font-bold uppercase transition-all duration-150 ${
                      isCorrect
                        ? 'bg-emerald-600 text-white border border-emerald-500 shadow-md shadow-emerald-600/30 cursor-not-allowed scale-95 opacity-90'
                        : isWrong
                        ? 'bg-slate-900 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-40'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 active:scale-95 shadow-sm'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
