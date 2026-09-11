import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Bot,
  Users,
  Trophy,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  X,
} from 'lucide-react';
import { PlayerColor, TavlaGameState, TavlaHint } from '../../games/tavla/types';
import {
  createInitialGameState,
  getValidMovesForOrigin,
  getAllLegalMoves,
  applyMove,
  getDiceCallout,
  isOpponentHomeBoardFullyClosed,
} from '../../games/tavla/engine';
import { chooseBestAiMove, getBestMoveHint } from '../../games/tavla/ai';
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
  const [hintEnabled, setHintEnabled] = useState(true);
  const [steppingPoint, setSteppingPoint] = useState<number | null>(null);

  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const turnTransitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRollingRef = useRef(false);
  const isMovingRef = useRef(false);
  const isTurnTransitioningRef = useRef(false);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      if (turnTransitionTimerRef.current) clearTimeout(turnTransitionTimerRef.current);
    };
  }, []);

  // Strict Turn Passer - strictly alternates White <-> Black with zero double-triggers
  const passTurnStrict = useCallback((prevState: TavlaGameState): TavlaGameState => {
    if (prevState.winner) return prevState;

    const nextTurn: PlayerColor = prevState.currentTurn === 'white' ? 'black' : 'white';

    // Check if next player is completely locked with all 6 gates closed
    const isFullyClosed =
      prevState.bar[nextTurn] > 0 && isOpponentHomeBoardFullyClosed(prevState, nextTurn);

    const statusMsg = isFullyClosed
      ? `${nextTurn === 'white' ? 'Beyaz' : 'Siyah'} oyuncunun giriş kapıları tamamen kapalı (6 kapı dolu). Sıra tekrar geçiyor.`
      : `Sıra ${nextTurn === 'white' ? 'Beyaz (Siz)' : 'Siyah'} oyuncuda. Zar atın!`;

    // Clear concurrency lock flags
    isRollingRef.current = false;
    isMovingRef.current = false;
    isTurnTransitioningRef.current = false;

    const nextState: TavlaGameState = {
      ...prevState,
      currentTurn: nextTurn,
      turnPhase: isFullyClosed ? 'turn_ended' : 'need_roll',
      selectedPoint: null,
      validDestinations: [],
      activeHint: null,
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
      if (turnTransitionTimerRef.current) clearTimeout(turnTransitionTimerRef.current);
      turnTransitionTimerRef.current = setTimeout(() => {
        setGameState((s) => passTurnStrict(s));
      }, 1800);
    }

    return nextState;
  }, []);

  // Debounced, collision-free single turn transition scheduler
  const scheduleTurnPass = useCallback((delay: number) => {
    if (turnTransitionTimerRef.current) {
      clearTimeout(turnTransitionTimerRef.current);
    }
    isTurnTransitioningRef.current = true;
    turnTransitionTimerRef.current = setTimeout(() => {
      isTurnTransitioningRef.current = false;
      setGameState((prev) => passTurnStrict(prev));
    }, delay);
  }, [passTurnStrict]);

  // Finalize Move: update state and evaluate turn completion
  const finalizeMove = useCallback((from: number | 'bar', to: number | 'off', diceUsed: number, isHit?: boolean) => {
    setGameState((currentGameState) => {
      const nextState = applyMove(currentGameState, from, to, diceUsed);

      if (soundEnabled) {
        if (isHit) {
          tavlaAudio.playHitSound();
        } else {
          tavlaAudio.playCheckerMove();
        }
      }

      if (nextState.winner) {
        if (soundEnabled) tavlaAudio.playVictoryFanfare();
        return { ...nextState, turnPhase: 'game_over' };
      }

      // Still has broken checker on bar?
      if (nextState.bar[nextState.currentTurn] > 0) {
        const remainingBarMoves = getValidMovesForOrigin(nextState, nextState.currentTurn, 'bar');
        nextState.selectedPoint = 'bar';
        nextState.validDestinations = Array.from(new Set(remainingBarMoves.map((m) => m.to)));

        if (remainingBarMoves.length === 0 && nextState.diceState.remainingMoves.length > 0) {
          nextState.turnPhase = 'turn_ended';
          nextState.statusMessage = 'Kalan zarla girilebilecek açık kapı yok. Sıra rakibe geçiyor.';
          scheduleTurnPass(1400);
          return nextState;
        }
      }

      // Turn complete or moves exhausted?
      if (nextState.diceState.remainingMoves.length === 0) {
        nextState.turnPhase = 'turn_ended';
        scheduleTurnPass(500);
      } else {
        const remainingLegal = getAllLegalMoves(nextState, nextState.currentTurn);
        if (remainingLegal.length === 0) {
          nextState.turnPhase = 'turn_ended';
          nextState.statusMessage = 'Kalan zarla oynanabilecek hamle kalmadı. Sıra geçiyor.';
          scheduleTurnPass(1200);
        }
      }

      return nextState;
    });
  }, [soundEnabled, scheduleTurnPass]);

  // Step-by-Step Animated Move Execution (Guarded against duplicate / overlapping moves)
  const executeAnimatedMove = useCallback((from: number | 'bar', to: number | 'off', onComplete?: () => void) => {
    if (isMovingRef.current) return;
    isMovingRef.current = true;

    const possibleMoves = getValidMovesForOrigin(gameState, gameState.currentTurn, from);
    const chosenMove = possibleMoves.find((m) => m.to === to);
    if (!chosenMove) {
      isMovingRef.current = false;
      return;
    }

    const finish = () => {
      isMovingRef.current = false;
      finalizeMove(from, to, chosenMove.diceUsed, chosenMove.isHit);
      if (onComplete) onComplete();
    };

    // Moving from Bar to Point on Board
    if (from === 'bar' && typeof to === 'number') {
      setSteppingPoint(to);
      if (soundEnabled) tavlaAudio.playCheckerMove();
      setTimeout(() => {
        setSteppingPoint(null);
        finish();
      }, 280);
      return;
    }

    // Moving to Bear-Off Tray
    if (typeof from === 'number' && to === 'off') {
      setSteppingPoint(from);
      if (soundEnabled) tavlaAudio.playCheckerMove();
      setTimeout(() => {
        setSteppingPoint(null);
        finish();
      }, 280);
      return;
    }

    // Standard Point to Point: Animate stepping across intermediate points (220ms per hop)
    if (typeof from === 'number' && typeof to === 'number') {
      const step = from < to ? 1 : -1;
      let current = from + step;
      const stepInterval = setInterval(() => {
        if ((step > 0 && current <= to) || (step < 0 && current >= to)) {
          setSteppingPoint(current);
          if (soundEnabled) tavlaAudio.playCheckerMove();
          current += step;
        } else {
          clearInterval(stepInterval);
          setSteppingPoint(null);
          finish();
        }
      }, 220);
    } else {
      finish();
    }
  }, [gameState, soundEnabled, finalizeMove]);

  // Roll Dice Action - Strictly guarded so players cannot roll twice in a single turn
  const handleRollDice = useCallback(() => {
    if (isRollingRef.current || isTurnTransitioningRef.current) return;
    if (gameState.turnPhase !== 'need_roll') return;
    if (gameState.diceState.remainingMoves.length > 0 || gameState.diceState.isRolling) return;
    if (gameState.winner) return;

    isRollingRef.current = true;
    if (turnTransitionTimerRef.current) clearTimeout(turnTransitionTimerRef.current);

    if (soundEnabled) tavlaAudio.playDiceRoll();

    // Set to rolling phase immediately
    setGameState((prev) => ({
      ...prev,
      turnPhase: 'rolling',
      diceState: {
        ...prev.diceState,
        isRolling: true,
        rollCallout: 'Zarlar atılıyor...',
      },
    }));

    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const callout = getDiceCallout(d1, d2);
      const moves = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];

      if (soundEnabled) tavlaAudio.playCheckerMove();
      isRollingRef.current = false;

      setGameState((prev) => {
        const testState: TavlaGameState = {
          ...prev,
          turnPhase: 'moving',
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

        // Check if legal moves exist
        const legal = getAllLegalMoves(testState, testState.currentTurn);
        if (legal.length === 0) {
          testState.turnPhase = 'turn_ended';
          if (testState.bar[testState.currentTurn] > 0) {
            testState.statusMessage = `Zarlar (${d1} - ${d2}) kapalı kapılara denk geldi! Tahtaya girilemedi, sıra rakibe geçiyor.`;
          } else {
            testState.statusMessage = `Gelen zarlarla (${d1} - ${d2}) oynanacak geçerli hamle yok! Sıra geçiyor.`;
          }

          scheduleTurnPass(1800);
        } else if (testState.bar[testState.currentTurn] > 0) {
          testState.statusMessage = 'Kırık taşınız için tahtadaki yeşil haneye tıklayarak girin!';
        } else {
          testState.statusMessage = 'Oynamak istediğiniz pulu seçin.';
        }

        return testState;
      });
    }, 850);
  }, [
    gameState.turnPhase,
    gameState.diceState.remainingMoves.length,
    gameState.diceState.isRolling,
    gameState.winner,
    soundEnabled,
    scheduleTurnPass,
  ]);

  // Handle selecting a point (or the bar)
  const handleSelectPoint = (from: number | 'bar') => {
    if (gameState.winner || gameState.turnPhase !== 'moving') return;
    if (gameState.diceState.remainingMoves.length === 0) return;
    if (gameState.gameMode === 'vs_ai' && gameState.currentTurn === 'black') return;

    // Deselect if already selected (unless bar is forced)
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

  const handleMoveTo = (target: number | 'off') => {
    if (!gameState.selectedPoint) return;
    executeAnimatedMove(gameState.selectedPoint, target);
  };

  // AI Turn Execution Effect
  useEffect(() => {
    if (gameState.gameMode !== 'vs_ai') return;
    if (gameState.currentTurn !== 'black') return;
    if (gameState.winner) return;

    // AI rolls when in need_roll phase
    if (
      gameState.turnPhase === 'need_roll' &&
      !isRollingRef.current &&
      !gameState.diceState.isRolling &&
      !isTurnTransitioningRef.current
    ) {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      aiTimerRef.current = setTimeout(() => {
        handleRollDice();
      }, 750);
      return;
    }

    // AI plays moves step-by-step when in moving phase
    if (
      gameState.turnPhase === 'moving' &&
      gameState.diceState.remainingMoves.length > 0 &&
      !gameState.isAiThinking &&
      !isMovingRef.current &&
      steppingPoint === null
    ) {
      setGameState((prev) => ({ ...prev, isAiThinking: true }));

      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      aiTimerRef.current = setTimeout(() => {
        const bestMove = chooseBestAiMove(gameState);
        if (bestMove) {
          executeAnimatedMove(bestMove.from, bestMove.to, () => {
            setGameState((s) => ({ ...s, isAiThinking: false }));
          });
        } else {
          setGameState((s) => ({ ...s, isAiThinking: false }));
          scheduleTurnPass(600);
        }
      }, 850);
    }
  }, [
    gameState.turnPhase,
    gameState.currentTurn,
    gameState.gameMode,
    gameState.winner,
    gameState.diceState.remainingMoves.length,
    gameState.diceState.isRolling,
    gameState.isAiThinking,
    steppingPoint,
    handleRollDice,
    executeAnimatedMove,
    scheduleTurnPass,
  ]);

  // Compute Visual Hint for Player 1 (White)
  const currentHint: TavlaHint | null =
    hintEnabled && gameState.currentTurn === 'white' && gameState.turnPhase === 'moving'
      ? getBestMoveHint(gameState)
      : null;

  const handlePlayHint = () => {
    if (!currentHint) return;
    executeAnimatedMove(currentHint.from, currentHint.to);
  };

  const handleRestartGame = () => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    if (turnTransitionTimerRef.current) clearTimeout(turnTransitionTimerRef.current);
    setGameState(createInitialGameState(gameState.gameMode));
  };

  const handleToggleMode = (mode: 'vs_ai' | 'vs_player') => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    if (turnTransitionTimerRef.current) clearTimeout(turnTransitionTimerRef.current);
    setGameState(createInitialGameState(mode));
  };

  const canCurrentPlayerRoll =
    gameState.turnPhase === 'need_roll' &&
    !gameState.diceState.isRolling &&
    !isRollingRef.current &&
    !isTurnTransitioningRef.current &&
    !gameState.winner &&
    (gameState.gameMode === 'vs_player' || gameState.currentTurn === 'white');

  return (
    <div className="min-h-screen py-6 px-3 sm:px-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a170b] via-[#1a0c05] to-[#0d0603] text-stone-100 flex flex-col items-center justify-between overflow-x-hidden select-none">
      {/* Top Header Controls Bar */}
      <div className="w-full max-w-7xl flex flex-wrap items-center justify-between gap-4 mb-3 bg-stone-900/80 border border-amber-950/70 p-4 rounded-2xl shadow-xl backdrop-blur-md">
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
              {gameState.gameMode === 'vs_ai' ? '🤖 Bilgisayara Karşı' : '👥 2 Kişilik Mod'}
            </p>
          </div>
        </div>

        {/* Mode Switch, Hint Toggle & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Hint Toggle Button (Açık / Kapalı) */}
          <button
            onClick={() => setHintEnabled(!hintEnabled)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
              hintEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-lg shadow-amber-500/20'
                : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
            }`}
            title="En iyi hamle ipucunu aç veya kapat"
          >
            <Lightbulb className={`w-4 h-4 ${hintEnabled ? 'text-amber-400 fill-amber-400/40' : 'text-stone-500'}`} />
            <span>İpucu: {hintEnabled ? 'Açık' : 'Kapalı'}</span>
          </button>

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
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
        {/* White Player Guide Card */}
        <div
          className={`p-3 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${
            gameState.currentTurn === 'white'
              ? 'bg-amber-950/50 border-amber-400 shadow-xl shadow-amber-500/20 ring-2 ring-amber-400/50'
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
                <span>Yön: <strong className="text-white">24 ➔ 1</strong></span>
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
              ? 'bg-amber-950/50 border-amber-400 shadow-xl shadow-amber-500/20 ring-2 ring-amber-400/50'
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
                <span>Yön: <strong className="text-white">1 ➔ 24</strong></span>
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

      {/* Visual Hint Recommendation Floating Banner (If Hint Enabled & Available) */}
      {currentHint && (
        <div className="w-full max-w-7xl mb-2 bg-gradient-to-r from-amber-500/20 via-amber-950/60 to-amber-500/20 border-2 border-amber-400 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl backdrop-blur-md animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
              <Lightbulb className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                  💡 EN İYİ HAMLE ÖNERİSİ
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black">
                  Zar: {currentHint.diceUsed}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-stone-200 mt-0.5">
                <strong className="text-amber-300">
                  {currentHint.from === 'bar' ? 'Bardan' : `${currentHint.from}. haneden`}{' '}
                  ➔ {currentHint.to === 'off' ? 'Toplamaya' : `${currentHint.to}. haneye`}
                </strong>{' '}
                oynayın — <span className="text-amber-200">{currentHint.reason}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePlayHint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs shadow-lg active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" /> Bu Hamleyi Oyna
            </button>
            <button
              onClick={() => setHintEnabled(false)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
              title="İpucunu Kapat"
            >
              <X className="w-4 h-4 text-amber-400" />
              <span>Kapat</span>
            </button>
          </div>
        </div>
      )}

      {/* Expansive Authentic Tavla Board */}
      <div className="w-full flex-1 flex flex-col justify-center items-center my-1">
        <TavlaBoard
          points={gameState.points}
          bar={gameState.bar}
          borneOff={gameState.borneOff}
          currentTurn={gameState.currentTurn}
          selectedPoint={gameState.selectedPoint}
          validDestinations={gameState.validDestinations}
          activeHint={currentHint}
          steppingPoint={steppingPoint}
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
      <div className="w-full max-w-7xl mt-3">
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
            <Sparkles className="w-3.5 h-3.5 animate-spin" /> Bilgisayar taşını düşünüp oynuyor...
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
