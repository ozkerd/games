import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { GamesHub } from './components/GamesHub';
import { DualHangmanGame } from './components/hangman/DualHangmanGame';
import { GameOverModal } from './components/GameOverModal';
import { ActiveView, PlayerScore } from './types';
import { HelpCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('hub');
  const [player1Name] = useState('Player 1');
  const [player2Name] = useState('Player 2');

  const [score, setScore] = useState<PlayerScore>({
    player1: 0,
    player2: 0,
  });

  const [gameOverData, setGameOverData] = useState<{
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

  const handleSelectGame = (gameId: string) => {
    if (gameId === 'game_hangman') {
      setActiveView('game_hangman');
    }
  };

  const handleGameOver = (
    winner: 'player1' | 'player2',
    secretWord: string,
    p1Mistakes: number,
    p2Mistakes: number
  ) => {
    setScore((prev) => ({
      ...prev,
      [winner]: prev[winner] + 1,
    }));
    setGameOverData({
      show: true,
      winner,
      secretWord,
      p1Mistakes,
      p2Mistakes,
    });
  };

  const handlePlayAgain = () => {
    setGameOverData((prev) => ({ ...prev, show: false }));
  };

  const handleBackToHub = () => {
    setGameOverData((prev) => ({ ...prev, show: false }));
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
        {/* Games Portal Hub */}
        {activeView === 'hub' && <GamesHub onSelectGame={handleSelectGame} />}

        {/* Dual Hangman Game */}
        {activeView === 'game_hangman' && (
          <DualHangmanGame
            player1Name={player1Name}
            player2Name={player2Name}
            onGameOver={handleGameOver}
          />
        )}

        {/* Game Over Modal */}
        {gameOverData.show && (
          <GameOverModal
            winner={gameOverData.winner}
            player1Name={player1Name}
            player2Name={player2Name}
            secretWord={gameOverData.secretWord}
            p1Mistakes={gameOverData.p1Mistakes}
            p2Mistakes={gameOverData.p2Mistakes}
            onPlayAgain={handlePlayAgain}
            onBackToHub={handleBackToHub}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            🎮 <strong>games.primerllm.com</strong> — Multi-Game Portal on Cloudflare Pages
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <HelpCircle className="w-3.5 h-3.5" /> 2 Players Share Same Keyboard
            </span>
            {activeView !== 'hub' && (
              <button
                onClick={() => setActiveView('hub')}
                className="text-indigo-400 hover:underline"
              >
                Return to Portal
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
