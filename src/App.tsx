import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { WordSetup } from './components/WordSetup';
import { HangmanGame } from './components/HangmanGame';
import { GameOverModal } from './components/GameOverModal';
import { GameState, PlayerScore } from './types';
import { HelpCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [activeGuesser, setActiveGuesser] = useState<1 | 2>(2); // Player 2 guesses by default

  const [score, setScore] = useState<PlayerScore>({
    player1: 0,
    player2: 0,
  });

  const [gameState, setGameState] = useState<GameState>({
    stage: 'setup',
    secretWord: '',
    category: '',
    guessedLetters: new Set<string>(),
    maxMistakes: 6,
    winner: null,
    player1Name: 'Player 1',
    player2Name: 'Player 2',
    activeGuesser: 2,
  });

  // Handle starting a new game round from WordSetup
  const handleStartGame = (word: string, category: string, maxMistakes: number) => {
    setGameState({
      stage: 'playing',
      secretWord: word,
      category,
      guessedLetters: new Set<string>(),
      maxMistakes,
      winner: null,
      player1Name,
      player2Name,
      activeGuesser,
    });
  };

  // Handle guessing a letter
  const handleGuessLetter = (letter: string) => {
    if (gameState.stage !== 'playing') return;

    const upperLetter = letter.toUpperCase();
    if (gameState.guessedLetters.has(upperLetter)) return;

    const updatedGuessed = new Set(gameState.guessedLetters);
    updatedGuessed.add(upperLetter);

    // Calculate wrong guesses
    const wrongGuesses = Array.from(updatedGuessed).filter(
      (char) => !gameState.secretWord.includes(char)
    );

    // Check if won (all alphabetic characters in secret word are guessed)
    const secretChars = gameState.secretWord
      .split('')
      .filter((char) => /^[A-Z]$/.test(char));
    const isWon = secretChars.every((char) => updatedGuessed.has(char));

    // Check if lost
    const isLost = wrongGuesses.length >= gameState.maxMistakes;

    if (isWon) {
      // Current guesser wins!
      const winningRole = activeGuesser === 2 ? 'player2' : 'player1';
      setScore((prev) => ({
        ...prev,
        [winningRole]: prev[winningRole] + 1,
      }));
      setGameState((prev) => ({
        ...prev,
        guessedLetters: updatedGuessed,
        stage: 'gameover',
        winner: winningRole,
      }));
    } else if (isLost) {
      // Word setter wins!
      const winningRole = activeGuesser === 2 ? 'player1' : 'player2';
      setScore((prev) => ({
        ...prev,
        [winningRole]: prev[winningRole] + 1,
      }));
      setGameState((prev) => ({
        ...prev,
        guessedLetters: updatedGuessed,
        stage: 'gameover',
        winner: winningRole,
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        guessedLetters: updatedGuessed,
      }));
    }
  };

  // Swap roles for next round
  const handleNextRoundSwap = () => {
    const newGuesser = activeGuesser === 2 ? 1 : 2;
    const newP1Name = player2Name;
    const newP2Name = player1Name;

    setPlayer1Name(newP1Name);
    setPlayer2Name(newP2Name);
    setActiveGuesser(newGuesser);

    setGameState({
      stage: 'setup',
      secretWord: '',
      category: '',
      guessedLetters: new Set<string>(),
      maxMistakes: 6,
      winner: null,
      player1Name: newP1Name,
      player2Name: newP2Name,
      activeGuesser: newGuesser,
    });
  };

  // Same roles for next round
  const handlePlayAgainSame = () => {
    setGameState({
      stage: 'setup',
      secretWord: '',
      category: '',
      guessedLetters: new Set<string>(),
      maxMistakes: 6,
      winner: null,
      player1Name,
      player2Name,
      activeGuesser,
    });
  };

  const handleResetScores = () => {
    setScore({ player1: 0, player2: 0 });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        score={score}
        player1Name={player1Name}
        player2Name={player2Name}
        activeGuesser={activeGuesser}
        onResetScores={handleResetScores}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {/* Stage 1: Setup Secret Word */}
        {gameState.stage === 'setup' && (
          <WordSetup
            player1Name={player1Name}
            player2Name={player2Name}
            onStartGame={handleStartGame}
          />
        )}

        {/* Stage 2 & 3: Gameplay */}
        {(gameState.stage === 'playing' || gameState.stage === 'gameover') && (
          <HangmanGame
            secretWord={gameState.secretWord}
            category={gameState.category}
            guessedLetters={gameState.guessedLetters}
            maxMistakes={gameState.maxMistakes}
            player1Name={player1Name}
            player2Name={player2Name}
            onGuessLetter={handleGuessLetter}
          />
        )}

        {/* Game Over Modal */}
        {gameState.stage === 'gameover' && gameState.winner && (
          <GameOverModal
            winner={gameState.winner}
            player1Name={player1Name}
            player2Name={player2Name}
            secretWord={gameState.secretWord}
            wrongGuessesCount={
              Array.from(gameState.guessedLetters).filter(
                (char) => !gameState.secretWord.includes(char)
              ).length
            }
            totalGuessesCount={gameState.guessedLetters.size}
            onNextRoundSwap={handleNextRoundSwap}
            onPlayAgainSame={handlePlayAgainSame}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            🎮 <strong>games.primerllm.com</strong> — Built for Cloudflare Pages
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <HelpCircle className="w-3.5 h-3.5" /> Pass the keyboard to play
            </span>
            <button
              onClick={handlePlayAgainSame}
              className="flex items-center gap-1 text-indigo-400 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Start New Match
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
