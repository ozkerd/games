import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { GamesHub } from './components/GamesHub';
import { DualHangmanGame } from './components/hangman/DualHangmanGame';
import { Connect4Game } from './components/games/Connect4Game';
import { MemoryCardGame } from './components/games/MemoryCardGame';
import { TicTacToeGame } from './components/games/TicTacToeGame';
import { OkeyGame } from './components/okey/OkeyGame';
import { TavlaGame } from './components/tavla/TavlaGame';
import { GameOverModal } from './components/GameOverModal';
import { ActiveView, PlayerScore } from './types';
import { HelpCircle } from 'lucide-react';

export const App: React.FC = () => {
  // Check if room or game URL param is present
  const urlParams = new URLSearchParams(window.location.search);
  const initialRoom = urlParams.get('room') || '';
  const initialGameParam = urlParams.get('game');

  const [activeView, setActiveView] = useState<ActiveView>(
    initialGameParam === 'okey' || initialRoom
      ? 'game_okey'
      : initialGameParam === 'tavla'
      ? 'game_tavla'
      : 'hub'
  );
  const [initialOkeyRoom] = useState<string>(initialRoom);
  const [player1Name] = useState('Player 1');
  const [player2Name] = useState('Player 2');

  const [score, setScore] = useState<PlayerScore>({
    player1: 0,
    player2: 0,
  });

  const [hangmanGameOverData, setHangmanGameOverData] = useState<{
    show: boolean;
    winner: 'player1' | 'player2';
    secretWord: string;
    p1Mistakes: number;
    p2Mistakes: number;
  }>({
    show: false,
    winner: 'player1',
    secretWord: '',
    p1Mistakes: 0,
    p2Mistakes: 0,
  });

  const handleSelectGame = (gameId: ActiveView) => {
    setActiveView(gameId);
  };

  const handleHangmanGameOver = (
    winner: 'player1' | 'player2',
    secretWord: string,
    p1Mistakes: number,
    p2Mistakes: number
  ) => {
    setScore((prev) => ({
      ...prev,
      [winner]: prev[winner] + 1,
    }));
    setHangmanGameOverData({
      show: true,
      winner,
      secretWord,
      p1Mistakes,
      p2Mistakes,
    });
  };

  const handleGenericGameOver = (winner: 'player1' | 'player2' | 'draw') => {
    if (winner !== 'draw') {
      setScore((prev) => ({
        ...prev,
        [winner]: prev[winner] + 1,
      }));
    }
  };

  const handleHangmanPlayAgain = () => {
    setHangmanGameOverData((prev) => ({ ...prev, show: false }));
  };

  const handleBackToHub = () => {
    setHangmanGameOverData((prev) => ({ ...prev, show: false }));
    setActiveView('hub');
  };

  const handleResetScores = () => {
    setScore({ player1: 0, player2: 0 });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        score={score}
        player1Name={player1Name}
        player2Name={player2Name}
        onNavigate={setActiveView}
        onResetScores={handleResetScores}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {/* Portal Hub */}
        {activeView === 'hub' && <GamesHub onSelectGame={handleSelectGame} />}

        {/* 1. Dual Hangman */}
        {activeView === 'game_hangman' && (
          <DualHangmanGame
            player1Name={player1Name}
            player2Name={player2Name}
            onGameOver={handleHangmanGameOver}
          />
        )}

        {/* 2. Connect 4 */}
        {activeView === 'game_connect4' && (
          <Connect4Game
            player1Name={player1Name}
            player2Name={player2Name}
            onGameOver={handleGenericGameOver}
            onBackToHub={handleBackToHub}
          />
        )}

        {/* 3. Memory Card Duel */}
        {activeView === 'game_memory' && (
          <MemoryCardGame
            player1Name={player1Name}
            player2Name={player2Name}
            onGameOver={handleGenericGameOver}
            onBackToHub={handleBackToHub}
          />
        )}

        {/* 4. Tic-Tac-Toe */}
        {activeView === 'game_tictactoe' && (
          <TicTacToeGame
            player1Name={player1Name}
            player2Name={player2Name}
            onGameOver={handleGenericGameOver}
            onBackToHub={handleBackToHub}
          />
        )}

        {/* 5. Okey & 101 Okey */}
        {activeView === 'game_okey' && (
          <OkeyGame
            initialRoomCode={initialOkeyRoom}
            onBackToHub={handleBackToHub}
          />
        )}

        {/* 6. Otantik Tavla (Backgammon) */}
        {activeView === 'game_tavla' && (
          <TavlaGame onBackToHub={handleBackToHub} />
        )}

        {/* Hangman Game Over Modal */}
        {hangmanGameOverData.show && (
          <GameOverModal
            winner={hangmanGameOverData.winner}
            player1Name={player1Name}
            player2Name={player2Name}
            secretWord={hangmanGameOverData.secretWord}
            p1Mistakes={hangmanGameOverData.p1Mistakes}
            p2Mistakes={hangmanGameOverData.p2Mistakes}
            onPlayAgain={handleHangmanPlayAgain}
            onBackToHub={handleBackToHub}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            🎮 <strong>Games</strong> — Arcade & Board Games Portal
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <HelpCircle className="w-3.5 h-3.5" /> 1 & 2 Players Supported
            </span>
            {activeView !== 'hub' && (
              <button
                onClick={() => setActiveView('hub')}
                className="text-indigo-400 hover:underline font-semibold"
              >
                Return to Games Hub
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
