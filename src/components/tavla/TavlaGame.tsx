import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Bot, Users, Trophy, Sparkles } from 'lucide-react';
import { PlayerColor, TavlaGameState } from '../../games/tavla/types';
import {
  createInitialGameState,
  getValidMovesForOrigin,
  getAllLegalMoves,
  applyMove,
  getDiceCallout,
  isOpponentHomeBoardFullyClosed,
} from '../../games/tavla/engine';
import { chooseBestAiMove } from '../../games/tavla/ai';
import { tavlaAudio } from '../../games/tavla/audio';
import { TavlaBoard } from './TavlaBoard';
import { TavlaDice } from './TavlaDice';

interface TavlaGameProps {
  onBackToHub: () => void;
}

export const TavlaGame: React.FC<TavlaGameProps> = ({ onBackToHub }) => {
  const [gameState, setGameState] = useState<TavlaGameState>(() =>
    createInitialGameState('vs_ai')
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, []);

  // Pass turn to the other player
  const passTurn = useCallback((prevState: TavlaGameState): TavlaGameState => {
    const nextTurn: PlayerColor = prevState.currentTurn === 'white' ? 'black' : 'white';

    // Check if next player has broken checkers AND all 6 entry gates are completely closed by primes
    let isFullyClosed = false;
    let statusMsg = `Sıra ${nextTurn === 'white' ? 'Beyaz' : 'Siyah'} oyuncuda. Zar atın!`;

    if (prevState.bar[nextTurn] > 0 && isOpponentHomeBoardFullyClosed(prevState, nextTurn)) {
      isFullyClosed = true;
      statusMsg = `${nextTurn === 'white' ? 'Beyaz' : 'Siyah'} oyuncunun giriş kapıları tamamen kapalı (6 kapı dolu). Tahtaya girilemediği için sıra rakipte.`;
    }

    const nextState: TavlaGameState = {
      ...prevState,
      currentTurn: nextTurn,
      selectedPoint: null,
      validDestinations: [],
      diceState: {
        dice: [0, 0],
        remainingMoves: [],
        isRolling: false,
        rollCallout: `${nextTurn === 'white' ? 'Beyaz' : 'Siyah'} oyuncu için zar bekleniyor.`,
        rolledBy: null,
      },
      statusMessage: statusMsg,
      isAiThinking: false,
    };

    if (isFullyClosed) {
      setTimeout(() => {
        setGameState((s) => passTurn(s));
      }, 2000);
    }

    return nextState;
  }, []);

  // Roll dice action
  const handleRollDice = useCallback(() => {
    if (gameState.diceState.isRolling || gameState.diceState.remainingMoves.length > 0) return;
    if (gameState.winner) return;

    if (soundEnabled) tavlaAudio.playDiceRoll();

    setGameState((prev) => ({
      ...prev,
      diceState: {
        ...prev.diceState,
        isRolling: true,
        rollCallout: 'Zarlar yuvarlanıyor...',
      },
    }));

    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const callout = getDiceCallout(d1, d2);
      const moves = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];

      if (soundEnabled) tavlaAudio.playCheckerMove();

      setGameState((prev) => {
        const testState: TavlaGameState = {
          ...prev,
          diceState: {
            dice: [d1, d2],
            remainingMoves: moves,
            isRolling: false,
            rollCallout: callout,
            rolledBy: prev.currentTurn,
          },
        };

        // If player has checkers on bar, auto-select bar and compute valid entry destinations!
        if (testState.bar[testState.currentTurn] > 0) {
          testState.selectedPoint = 'bar';
          const barMoves = getValidMovesForOrigin(testState, testState.currentTurn, 'bar');
          testState.validDestinations = Array.from(new Set(barMoves.map((m) => m.to)));
        }

        // Check if any legal move is possible
        const legal = getAllLegalMoves(testState, testState.currentTurn);
        if (legal.length === 0) {
          if (testState.bar[testState.currentTurn] > 0) {
            testState.statusMessage = `Zarlar (${d1} - ${d2}) kapalı kapılara denk geldi! Kırık taş girilemedi, sıra rakibe geçiyor.`;
          } else {
            testState.statusMessage = `Gelen zarlarla (${d1} - ${d2}) oynanacak geçerli hamle yok! Sıra geçiyor.`;
          }
          setTimeout(() => {
            setGameState((s) => passTurn(s));
          }, 1800);
        } else if (testState.bar[testState.currentTurn] > 0) {
          testState.statusMessage = 'Kırık taşınız için tahtadaki yeşil haneye tıklayarak girin!';
        } else {
          testState.statusMessage = 'Oynamak istediğiniz pulu seçin.';
        }

        return testState;
      });
    }, 800);
  }, [gameState.diceState.isRolling, gameState.diceState.remainingMoves.length, gameState.winner, soundEnabled, passTurn]);

  // Handle selecting a point (or the bar)
  const handleSelectPoint = (from: number | 'bar') => {
    if (gameState.winner) return;
    if (gameState.diceState.remainingMoves.length === 0) return;
    if (gameState.gameMode === 'vs_ai' && gameState.currentTurn === 'black') return;

    // Check if clicked already selected point -> deselect (unless bar is forced)
    if (gameState.selectedPoint === from && gameState.bar[gameState.currentTurn] === 0) {
      setGameState((prev) => ({
        ...prev,
        selectedPoint: null,
        validDestinations: [],
      }));
      return;
    }

    const validMoves = getValidMovesForOrigin(gameState, gameState.currentTurn, from);
    if (validMoves.length === 0) return;

    const destinations = Array.from(new Set(validMoves.map((m) => m.to)));

    setGameState((prev) => ({
      ...prev,
      selectedPoint: from,
      validDestinations: destinations,
    }));
  };

  // Handle moving to a destination
  const handleMoveTo = (target: number | 'off') => {
    if (!gameState.selectedPoint) return;
    const origin = gameState.selectedPoint;

    const possibleMoves = getValidMovesForOrigin(gameState, gameState.currentTurn, origin);
    const chosenMove = possibleMoves.find((m) => m.to === target);
    if (!chosenMove) return;

    const nextState = applyMove(gameState, origin, target, chosenMove.diceUsed);

    if (soundEnabled) {
      if (chosenMove.isHit) {
        tavlaAudio.playHitSound();
      } else {
        tavlaAudio.playCheckerMove();
      }
    }

    if (nextState.winner) {
      if (soundEnabled) tavlaAudio.playVictoryFanfare();
      setGameState(nextState);
      return;
    }

    // Check remaining broken checkers on bar
    if (nextState.bar[nextState.currentTurn] > 0) {
      const remainingBarMoves = getValidMovesForOrigin(nextState, nextState.currentTurn, 'bar');
      nextState.selectedPoint = 'bar';
      nextState.validDestinations = Array.from(new Set(remainingBarMoves.map((m) => m.to)));

      if (remainingBarMoves.length === 0 && nextState.diceState.remainingMoves.length > 0) {
        nextState.statusMessage = 'Kalan zarla girilebilecek açık kapı yok. Sıra rakibe geçiyor.';
        setGameState(nextState);
        setTimeout(() => {
          setGameState((prev) => passTurn(prev));
        }, 1500);
        return;
      }
    }

    // Check if remaining moves have any legal move left
    if (nextState.diceState.remainingMoves.length === 0) {
      // Turn complete! Switch player
      setTimeout(() => {
        setGameState((prev) => passTurn(prev));
      }, 500);
      setGameState(nextState);
    } else {
      const remainingLegal = getAllLegalMoves(nextState, nextState.currentTurn);
      if (remainingLegal.length === 0) {
        // Has unused dice but nowhere to move
        nextState.statusMessage = 'Kalan zarla oynanabilecek hamle kalmadı. Sıra geçiyor.';
        setGameState(nextState);
        setTimeout(() => {
          setGameState((prev) => passTurn(prev));
        }, 1400);
      } else {
        setGameState(nextState);
      }
    }
  };

  // AI Turn Execution Effect
  useEffect(() => {
    if (gameState.gameMode !== 'vs_ai') return;
    if (gameState.currentTurn !== 'black') return;
    if (gameState.winner) return;

    // AI needs to roll first
    if (gameState.diceState.remainingMoves.length === 0 && !gameState.diceState.isRolling) {
      aiTimeoutRef.current = setTimeout(() => {
        handleRollDice();
      }, 800);
      return;
    }

    // AI has dice to play
    if (
      gameState.diceState.remainingMoves.length > 0 &&
      !gameState.diceState.isRolling &&
      !gameState.isAiThinking
    ) {
      setGameState((prev) => ({ ...prev, isAiThinking: true }));

      aiTimeoutRef.current = setTimeout(() => {
        const bestMove = chooseBestAiMove(gameState);
        if (bestMove) {
          const nextState = applyMove(
            gameState,
            bestMove.from,
            bestMove.to,
            bestMove.diceUsed
          );

          if (soundEnabled) {
            if (bestMove.isHit) {
              tavlaAudio.playHitSound();
            } else {
              tavlaAudio.playCheckerMove();
            }
          }

          if (nextState.winner) {
            if (soundEnabled) tavlaAudio.playVictoryFanfare();
            setGameState(nextState);
            return;
          }

          if (nextState.diceState.remainingMoves.length === 0) {
            setTimeout(() => {
              setGameState((prev) => passTurn(prev));
            }, 600);
            setGameState({ ...nextState, isAiThinking: false });
          } else {
            const nextLegal = getAllLegalMoves(nextState, 'black');
            if (nextLegal.length === 0) {
              nextState.statusMessage = 'Bilgisayar kalan zarla oynayamıyor. Sıra size geçiyor.';
              setGameState({ ...nextState, isAiThinking: false });
              setTimeout(() => {
                setGameState((prev) => passTurn(prev));
              }, 1200);
            } else {
              setGameState({ ...nextState, isAiThinking: false });
            }
          }
        } else {
          // No moves possible for AI
          setGameState((prev) => passTurn(prev));
        }
      }, 900);
    }
  }, [
    gameState,
    handleRollDice,
    passTurn,
    soundEnabled,
  ]);

  const handleRestartGame = () => {
    setGameState(createInitialGameState(gameState.gameMode));
  };

  const handleToggleMode = (mode: 'vs_ai' | 'vs_player') => {
    setGameState(createInitialGameState(mode));
  };

  const canCurrentPlayerRoll =
    gameState.diceState.remainingMoves.length === 0 &&
    !gameState.diceState.isRolling &&
    !gameState.winner &&
    (gameState.gameMode === 'vs_player' || gameState.currentTurn === 'white');

  return (
    <div className="min-h-screen py-6 px-3 sm:px-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a170b] via-[#1a0c05] to-[#0d0603] text-stone-100 flex flex-col items-center justify-between">
      {/* Top Header Controls Bar */}
      <div className="w-full max-w-7xl flex flex-wrap items-center justify-between gap-4 mb-4 bg-stone-900/80 border border-amber-950/70 p-4 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-all border border-stone-700 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Oyunlara Dön
          </button>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-200 tracking-wide font-serif flex items-center gap-2">
              🎲 Otantik Tavla <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Klasik</span>
            </h2>
            <p className="text-xs text-stone-400">
              {gameState.gameMode === 'vs_ai' ? '🤖 Bilgisayara Karşı' : '👥 2 Kişilik'}
            </p>
          </div>
        </div>

        {/* Mode Switch & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => handleToggleMode('vs_ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                gameState.gameMode === 'vs_ai'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" /> Bilgisayar
            </button>
            <button
              onClick={() => handleToggleMode('vs_player')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                gameState.gameMode === 'vs_player'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> 2 Kişilik
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-all cursor-pointer"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
          </button>

          <button
            onClick={handleRestartGame}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-all border border-stone-700 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Yeniden Başlat
          </button>
        </div>
      </div>

      {/* High-Contrast Player & Movement Direction Guide */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* White Player Guide Card */}
        <div
          className={`p-3 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${
            gameState.currentTurn === 'white'
              ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/50'
              : 'bg-stone-900/60 border-stone-800 opacity-70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white via-amber-50 to-stone-200 border-2 border-amber-300 shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center text-base">
              ⚪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-amber-200">
                  BEYAZ (Siz / Oyuncu 1)
                </span>
                {gameState.currentTurn === 'white' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-[10px] animate-pulse">
                    SIRA SİZDE
                  </span>
                )}
              </div>
              <div className="text-xs text-stone-300 flex items-center gap-2 mt-0.5">
                <span>Yön: <strong className="text-white">24 ➔ 1</strong> (Saat yönünün tersi)</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">Toplama: Sağ Alt (1-6)</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Toplanan</span>
            <span className="text-base font-black text-amber-300 font-mono">
              {gameState.borneOff.white} / 15
            </span>
          </div>
        </div>

        {/* Black Player Guide Card */}
        <div
          className={`p-3 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${
            gameState.currentTurn === 'black'
              ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/50'
              : 'bg-stone-900/60 border-stone-800 opacity-70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-800 via-stone-900 to-black border-2 border-stone-700 shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-center text-base">
              ⚫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-amber-200">
                  SİYAH ({gameState.gameMode === 'vs_ai' ? 'Bilgisayar' : 'Oyuncu 2'})
                </span>
                {gameState.currentTurn === 'black' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white font-black text-[10px] animate-pulse">
                    SIRA SİYAHTA
                  </span>
                )}
              </div>
              <div className="text-xs text-stone-300 flex items-center gap-2 mt-0.5">
                <span>Yön: <strong className="text-white">1 ➔ 24</strong> (Saat yönü)</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">Toplama: Sağ Üst (19-24)</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Toplanan</span>
            <span className="text-base font-black text-amber-300 font-mono">
              {gameState.borneOff.black} / 15
            </span>
          </div>
        </div>
      </div>

      {/* Expansive Authentic Tavla Board */}
      <div className="w-full flex-1 flex flex-col justify-center items-center my-1">
        <TavlaBoard
          points={gameState.points}
          bar={gameState.bar}
          borneOff={gameState.borneOff}
          currentTurn={gameState.currentTurn}
          selectedPoint={gameState.selectedPoint}
          validDestinations={gameState.validDestinations}
          dice={gameState.diceState.dice}
          remainingMoves={gameState.diceState.remainingMoves}
          isRolling={gameState.diceState.isRolling}
          canRoll={canCurrentPlayerRoll}
          onRoll={handleRollDice}
          onSelectPoint={handleSelectPoint}
          onMoveTo={handleMoveTo}
        />
      </div>

      {/* Bottom Dice Control & Status Bar */}
      <div className="w-full max-w-7xl mt-4">
        <TavlaDice
          dice={gameState.diceState.dice}
          remainingMoves={gameState.diceState.remainingMoves}
          isRolling={gameState.diceState.isRolling}
          rollCallout={gameState.diceState.rollCallout}
          currentTurn={gameState.currentTurn}
          canRoll={canCurrentPlayerRoll}
          onRoll={handleRollDice}
        />

        {/* AI Thinking Notice */}
        {gameState.isAiThinking && (
          <div className="mt-2 flex items-center justify-center gap-2 text-xs font-bold text-amber-400 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 animate-spin" /> Bilgisayar hamlesini düşünüyor...
          </div>
        )}
      </div>

      {/* Victory / Game Over Modal */}
      {gameState.winner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-stone-900 via-[#261309] to-stone-950 border-2 border-amber-500 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl shadow-amber-500/20 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/40">
              <Trophy className="w-10 h-10 text-stone-950" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {gameState.winType === 'katmerli_mars'
                  ? '🌟 KATMERLİ MARS!'
                  : gameState.winType === 'mars'
                  ? '🔥 MARS!'
                  : '🏆 OYUN BİTTİ'}
              </span>
              <h3 className="text-3xl font-extrabold text-white mt-1">
                {gameState.winner === 'white' ? 'Beyaz Oyuncu Kazandı!' : 'Siyah Oyuncu Kazandı!'}
              </h3>
              <p className="text-sm text-stone-300 mt-2">
                {gameState.winType === 'katmerli_mars'
                  ? 'Muazzam Zafer! Rakip hiç taş toplayamadı ve evinizde kırık taşı kaldı (3 Puan)!'
                  : gameState.winType === 'mars'
                  ? 'Harika galibiyet! Rakip henüz hiç taş toplayamadan oyunu bitirdiniz (2 Puan)!'
                  : 'Tebrikler! 15 taşın tamamını toplayarak galip geldiniz.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRestartGame}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-base shadow-lg shadow-amber-500/30 active:scale-95 transition-all cursor-pointer"
              >
                Yeni Oyun Başlat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
