import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { OkeyGameState, OkeyVariant, OkeyPlayerCount, OkeyMode, Tile } from '../../games/okey/types';
import { initializeGame, autoSortSeries, autoSortPairs, getBotAction, isRealOkey, calculateMeldPoints } from '../../games/okey/engine';
import { OkeyP2PManager } from '../../games/okey/p2p';
import { OkeyTable } from './OkeyTable';
import { OkeyRack } from './OkeyRack';
import { Users, Bot, Globe, Copy, Check, Trophy, RotateCcw, LayoutGrid, Play, ArrowLeft } from 'lucide-react';

interface OkeyGameProps {
  initialRoomCode?: string;
  onBackToHub: () => void;
}

export const OkeyGame: React.FC<OkeyGameProps> = ({ initialRoomCode, onBackToHub }) => {
  const [stage, setStage] = useState<'setup' | 'online_lobby' | 'playing' | 'gameover'>('setup');
  const [variant, setVariant] = useState<OkeyVariant>('classic');
  const [playerCount, setPlayerCount] = useState<OkeyPlayerCount>(4);
  const [mode, setMode] = useState<OkeyMode>(initialRoomCode ? 'online' : 'vs_ai');

  const [gameState, setGameState] = useState<OkeyGameState | null>(null);
  const [roomCode, setRoomCode] = useState<string>(initialRoomCode || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [onlineConnectedCount, setOnlineConnectedCount] = useState(1);
  const [myPlayerIndex, setMyPlayerIndex] = useState(0);

  const p2pRef = useRef<OkeyP2PManager | null>(null);

  // Auto-connect if initialRoomCode passed via URL query
  useEffect(() => {
    if (initialRoomCode) {
      setMode('online');
      setRoomCode(initialRoomCode);
    }
  }, [initialRoomCode]);

  // Start Solo Game (Vs AI Bots)
  const handleStartVsAI = () => {
    const newGame = initializeGame(variant, playerCount, 'vs_ai');
    setGameState(newGame);
    setMyPlayerIndex(0);
    setStage('playing');
  };

  // Create Online Room (Host)
  const handleCreateOnlineRoom = () => {
    const generatedCode = `OKEY-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomCode(generatedCode);
    setMyPlayerIndex(0);

    const p2p = new OkeyP2PManager({
      onStateReceived: (state) => setGameState(state),
      onPlayerCountChanged: (count) => setOnlineConnectedCount(count),
      onActionReceived: (msg) => {
        // Handle guest action
        console.log('Action received:', msg);
      },
    });
    p2pRef.current = p2p;

    p2p.createRoom(
      generatedCode,
      'Host',
      () => {
        setStage('online_lobby');
      },
      (err) => {
        console.error('P2P Host error:', err);
        // Fallback to local game if signalling is blocked
        handleStartVsAI();
      }
    );
  };

  // Join Online Room (Guest)
  const handleJoinOnlineRoom = (code: string) => {
    setRoomCode(code);
    setMyPlayerIndex(1);

    const p2p = new OkeyP2PManager({
      onStateReceived: (state) => {
        setGameState(state);
        setStage('playing');
      },
      onError: (err: any) => {
        console.error('P2P Join error:', err);
      },
    });
    p2pRef.current = p2p;

    p2p.joinRoom(
      code,
      'Misafir Oyuncu',
      () => {
        setStage('online_lobby');
      },
      (err) => {
        console.error('Join error:', err);
      }
    );
  };

  // Host starts the online game
  const handleStartOnlineMatch = () => {
    const newGame = initializeGame(variant, playerCount, 'online');
    setGameState(newGame);
    if (p2pRef.current) {
      p2pRef.current.broadcastState(newGame);
    }
    setStage('playing');
  };

  // Copy shareable invitation link
  const copyInviteLink = () => {
    const link = `${window.location.origin}/?game=okey&room=${roomCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Move / Swap tile on rack
  const handleMoveTile = (fromIdx: number, toIdx: number) => {
    if (!gameState) return;
    const player = gameState.players[myPlayerIndex];
    const newTiles = [...player.tiles];
    const temp = newTiles[fromIdx];
    newTiles[fromIdx] = newTiles[toIdx];
    newTiles[toIdx] = temp;

    const updatedPlayers = [...gameState.players];
    updatedPlayers[myPlayerIndex] = { ...player, tiles: newTiles };
    setGameState((prev) => (prev ? { ...prev, players: updatedPlayers } : null));
  };

  // Auto-sort by Series (Runs)
  const handleSortSeries = () => {
    if (!gameState) return;
    const player = gameState.players[myPlayerIndex];
    const sorted = autoSortSeries(player.tiles, gameState.okeyTile);

    const updatedPlayers = [...gameState.players];
    updatedPlayers[myPlayerIndex] = { ...player, tiles: sorted };
    setGameState((prev) => (prev ? { ...prev, players: updatedPlayers } : null));
  };

  // Auto-sort by Pairs (Çift)
  const handleSortPairs = () => {
    if (!gameState) return;
    const player = gameState.players[myPlayerIndex];
    const sorted = autoSortPairs(player.tiles, gameState.okeyTile);

    const updatedPlayers = [...gameState.players];
    updatedPlayers[myPlayerIndex] = { ...player, tiles: sorted };
    setGameState((prev) => (prev ? { ...prev, players: updatedPlayers } : null));
  };

  // Draw tile from deck
  const handleDrawDeck = () => {
    if (!gameState || gameState.currentTurn !== myPlayerIndex || gameState.turnPhase !== 'draw') return;
    if (gameState.deck.length === 0) return;

    const newDeck = [...gameState.deck];
    const drawnTile = newDeck.pop()!;

    const player = gameState.players[myPlayerIndex];
    const newTiles = [...player.tiles];
    // Place in first empty slot
    const emptySlot = newTiles.findIndex((t) => t === null);
    if (emptySlot !== -1) {
      newTiles[emptySlot] = drawnTile;
    }

    const updatedPlayers = [...gameState.players];
    updatedPlayers[myPlayerIndex] = { ...player, tiles: newTiles };

    const nextState: OkeyGameState = {
      ...gameState,
      deck: newDeck,
      players: updatedPlayers,
      turnPhase: 'discard',
      lastDrawnFrom: 'deck',
    };

    setGameState(nextState);
    if (p2pRef.current) p2pRef.current.broadcastState(nextState);
  };

  // Draw tile from right player's discard
  const handleDrawDiscard = () => {
    if (!gameState || gameState.currentTurn !== myPlayerIndex || gameState.turnPhase !== 'draw') return;

    const prevPlayerIdx = (myPlayerIndex - 1 + gameState.playerCount) % gameState.playerCount;
    const prevPile = [...(gameState.discardPiles[prevPlayerIdx] || [])];
    if (prevPile.length === 0) return;

    const drawnTile = prevPile.pop()!;

    const player = gameState.players[myPlayerIndex];
    const newTiles = [...player.tiles];
    const emptySlot = newTiles.findIndex((t) => t === null);
    if (emptySlot !== -1) {
      newTiles[emptySlot] = drawnTile;
    }

    const updatedPlayers = [...gameState.players];
    updatedPlayers[myPlayerIndex] = { ...player, tiles: newTiles };

    const nextDiscardPiles = { ...gameState.discardPiles, [prevPlayerIdx]: prevPile };

    const nextState: OkeyGameState = {
      ...gameState,
      discardPiles: nextDiscardPiles,
      players: updatedPlayers,
      turnPhase: 'discard',
      lastDrawnFrom: 'discard',
    };

    setGameState(nextState);
    if (p2pRef.current) p2pRef.current.broadcastState(nextState);
  };

  // Discard tile to own tray & advance turn
  const handleDiscardTile = (slotIdx: number) => {
    if (!gameState || gameState.currentTurn !== myPlayerIndex || gameState.turnPhase !== 'discard') return;

    const player = gameState.players[myPlayerIndex];
    const discardedTile = player.tiles[slotIdx];
    if (!discardedTile) return;

    const newTiles = [...player.tiles];
    newTiles[slotIdx] = null;

    const updatedPlayers = [...gameState.players];
    updatedPlayers[myPlayerIndex] = { ...player, tiles: newTiles };

    const myDiscardPile = [...(gameState.discardPiles[myPlayerIndex] || []), discardedTile];
    const nextDiscardPiles = { ...gameState.discardPiles, [myPlayerIndex]: myDiscardPile };

    const nextTurn = (gameState.currentTurn + 1) % gameState.playerCount;

    const nextState: OkeyGameState = {
      ...gameState,
      players: updatedPlayers,
      discardPiles: nextDiscardPiles,
      currentTurn: nextTurn,
      turnPhase: 'draw',
      lastDrawnFrom: null,
    };

    setGameState(nextState);
    if (p2pRef.current) p2pRef.current.broadcastState(nextState);
  };

  // Open hand in 101 mode
  const handleOpen101 = () => {
    if (!gameState || gameState.variant !== '101') return;
    const player = gameState.players[myPlayerIndex];
    const activeTiles = player.tiles.filter((t): t is Tile => t !== null);

    // Calculate score
    const totalScore = calculateMeldPoints(activeTiles.slice(0, 9), gameState.okeyTile);
    const updatedPlayers = [...gameState.players];
    updatedPlayers[myPlayerIndex] = {
      ...player,
      hasOpened: true,
      openScore: Math.max(totalScore, 101),
    };

    const newMeld = {
      playerId: player.id,
      playerName: player.name,
      tiles: activeTiles.slice(0, 6),
      type: 'run' as const,
    };

    const nextState: OkeyGameState = {
      ...gameState,
      players: updatedPlayers,
      openedSets: [...gameState.openedSets, newMeld],
    };

    setGameState(nextState);
    if (p2pRef.current) p2pRef.current.broadcastState(nextState);
  };

  // Finish Hand (Bitti / Okey At)
  const handleFinishHand = (slotIdx: number) => {
    if (!gameState) return;
    const player = gameState.players[myPlayerIndex];
    const discardedTile = player.tiles[slotIdx];
    const isOkey = discardedTile ? isRealOkey(discardedTile, gameState.okeyTile) : false;

    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

    const nextState: OkeyGameState = {
      ...gameState,
      winner: {
        playerId: player.id,
        playerName: player.name,
        reason: isOkey ? 'Okey Atarak Bitti! (2 Kat Puan 🎉)' : 'Elden Bitti! 🏆',
        isOkeyFinish: isOkey,
      },
    };

    setGameState(nextState);
    setStage('gameover');
    if (p2pRef.current) p2pRef.current.broadcastState(nextState);
  };

  // BOT AI TURN EXECUTION
  useEffect(() => {
    if (!gameState || stage !== 'playing' || gameState.winner) return;
    const currentPlayer = gameState.players[gameState.currentTurn];

    if (currentPlayer && currentPlayer.isBot) {
      if (gameState.turnPhase === 'draw') {
        const timer = setTimeout(() => {
          const botMove = getBotAction(gameState.currentTurn, gameState);
          if (botMove.action === 'draw_discard') {
            // Bot draws discard
            const prevPlayerIdx = (gameState.currentTurn - 1 + gameState.playerCount) % gameState.playerCount;
            const prevPile = [...(gameState.discardPiles[prevPlayerIdx] || [])];
            if (prevPile.length > 0) {
              const drawn = prevPile.pop()!;
              const botTiles = [...currentPlayer.tiles];
              const emptySlot = botTiles.findIndex((t) => t === null);
              if (emptySlot !== -1) botTiles[emptySlot] = drawn;

              const updatedPlayers = [...gameState.players];
              updatedPlayers[gameState.currentTurn] = { ...currentPlayer, tiles: botTiles };

              setGameState((prev) =>
                prev
                  ? {
                      ...prev,
                      players: updatedPlayers,
                      discardPiles: { ...prev.discardPiles, [prevPlayerIdx]: prevPile },
                      turnPhase: 'discard',
                    }
                  : null
              );
            }
          } else {
            // Bot draws from deck
            if (gameState.deck.length > 0) {
              const newDeck = [...gameState.deck];
              const drawn = newDeck.pop()!;
              const botTiles = [...currentPlayer.tiles];
              const emptySlot = botTiles.findIndex((t) => t === null);
              if (emptySlot !== -1) botTiles[emptySlot] = drawn;

              const updatedPlayers = [...gameState.players];
              updatedPlayers[gameState.currentTurn] = { ...currentPlayer, tiles: botTiles };

              setGameState((prev) =>
                prev
                  ? {
                      ...prev,
                      deck: newDeck,
                      players: updatedPlayers,
                      turnPhase: 'discard',
                    }
                  : null
              );
            }
          }
        }, 900);
        return () => clearTimeout(timer);
      } else if (gameState.turnPhase === 'discard') {
        const timer = setTimeout(() => {
          const botMove = getBotAction(gameState.currentTurn, gameState);
          const discardSlot = (botMove as any).tileSlot ?? currentPlayer.tiles.findIndex((t) => t !== null);

          const discardedTile = currentPlayer.tiles[discardSlot];
          if (discardedTile) {
            const botTiles = [...currentPlayer.tiles];
            botTiles[discardSlot] = null;

            const updatedPlayers = [...gameState.players];
            updatedPlayers[gameState.currentTurn] = { ...currentPlayer, tiles: botTiles };

            const myDiscard = [...(gameState.discardPiles[gameState.currentTurn] || []), discardedTile];
            const nextTurn = (gameState.currentTurn + 1) % gameState.playerCount;

            setGameState((prev) =>
              prev
                ? {
                    ...prev,
                    players: updatedPlayers,
                    discardPiles: { ...prev.discardPiles, [prev.currentTurn]: myDiscard },
                    currentTurn: nextTurn,
                    turnPhase: 'draw',
                  }
                : null
            );
          }
        }, 1100);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, stage]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* SETUP STAGE */}
      {stage === 'setup' && (
        <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xl">
              🀄
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
                Geleneksel Türk Oyunu
              </span>
              <h2 className="font-display text-2xl font-bold text-white">
                Okey & 101 Okey
              </h2>
            </div>
          </div>

          {/* Okey Variant Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Oyun Türü Seçin
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVariant('classic')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  variant === 'classic'
                    ? 'bg-amber-600/20 border-amber-500 text-white ring-1 ring-amber-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-base text-amber-300 block mb-1">Düz Okey (Klasik)</span>
                <p className="text-xs text-slate-400">14/15 taş ile per ve çift dizilimi, elden bitme</p>
              </button>

              <button
                type="button"
                onClick={() => setVariant('101')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  variant === '101'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-base text-emerald-300 block mb-1">101 Okey (Yüzbir)</span>
                <p className="text-xs text-slate-400">21/22 taş, 101 barajı, masaya per açma ve işleme</p>
              </button>
            </div>
          </div>

          {/* Player Count Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Masa Kişi Sayısı
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlayerCount(2)}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                  playerCount === 2
                    ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                2 Kişilik (Birebir Düello)
              </button>
              <button
                type="button"
                onClick={() => setPlayerCount(4)}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                  playerCount === 4
                    ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                4 Kişilik (Tam Masa)
              </button>
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Oynama Şekli
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('vs_ai')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  mode === 'vs_ai'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold text-sm">Bilgisayara Karşı</span>
                </div>
                <p className="text-xs text-slate-400">Beklemeden akıllı AI botlarla tek tıkla oyna</p>
              </button>

              <button
                type="button"
                onClick={() => setMode('online')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  mode === 'online'
                    ? 'bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-5 h-5 text-purple-400" />
                  <span className="font-bold text-sm">Online Link ile Paylaş</span>
                </div>
                <p className="text-xs text-slate-400">Oda kodu & linki ile arkadaşlarınla oyna</p>
              </button>
            </div>
          </div>

          {/* Action Button */}
          {mode === 'vs_ai' ? (
            <button
              onClick={handleStartVsAI}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 text-white font-display font-bold text-lg hover:from-amber-600 hover:to-rose-700 shadow-xl shadow-amber-600/25 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              Oyunu Başlat (Hemen Oyna)
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleCreateOnlineRoom}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-display font-bold text-lg shadow-xl shadow-purple-600/25 transition-all flex items-center justify-center gap-2"
              >
                <Globe className="w-5 h-5" />
                Online Oda Kur & Link Al
              </button>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Oda Kodu Girin (örn: OKEY-1234)"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm uppercase tracking-wider font-mono focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => handleJoinOnlineRoom(roomCode)}
                  disabled={!roomCode}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-sm transition-all"
                >
                  Katıl
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ONLINE LOBBY MODAL */}
      {stage === 'online_lobby' && (
        <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
            <Globe className="w-8 h-8 animate-spin" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold">
              Online Oda Hazır
            </span>
            <h2 className="font-display text-2xl font-bold text-white mt-1">
              Oda Kodu: {roomCode}
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Bu bağlantıyı arkadaşınıza gönderin. Tarayıcıdan tıkladığı an oyuna katılacaktır!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <span className="font-mono text-xs text-indigo-300 truncate">
              {window.location.origin}/?game=okey&room={roomCode}
            </span>
            <button
              onClick={copyInviteLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all shrink-0"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Kopyalandı!' : 'Linki Kopyala'}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Bağlı Oyuncu: <strong className="text-white">{onlineConnectedCount} / {playerCount}</strong></span>
          </div>

          <button
            onClick={handleStartOnlineMatch}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-display font-bold text-base shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            Taşları Dağıt ve Oyunu Başlat
          </button>
        </div>
      )}

      {/* PLAYING ARENA */}
      {stage === 'playing' && gameState && (
        <div className="space-y-6">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between px-2">
            <button
              onClick={() => setStage('setup')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Masa Ayarlarına Dön
            </button>

            {gameState.roomCode && (
              <span className="text-xs font-mono text-purple-300 bg-purple-950/60 border border-purple-800/60 px-3 py-1 rounded-lg">
                Oda: {gameState.roomCode}
              </span>
            )}
          </div>

          {/* REALISTIC GREEN VELVET FELT CASINO TABLE */}
          <OkeyTable
            state={gameState}
            myPlayerIndex={myPlayerIndex}
            onDrawDeck={handleDrawDeck}
            onDrawDiscard={handleDrawDiscard}
          />

          {/* REALISTIC WOODEN ISTAKA (CUE RACK) */}
          <OkeyRack
            tiles={gameState.players[myPlayerIndex].tiles}
            okeyTile={gameState.okeyTile}
            isMyTurn={gameState.currentTurn === myPlayerIndex}
            canDiscard={gameState.currentTurn === myPlayerIndex && gameState.turnPhase === 'discard'}
            canOpen101={gameState.variant === '101' && !gameState.players[myPlayerIndex].hasOpened}
            onMoveTile={handleMoveTile}
            onDiscardTile={handleDiscardTile}
            onSortSeries={handleSortSeries}
            onSortPairs={handleSortPairs}
            onOpen101={handleOpen101}
            onFinishHand={handleFinishHand}
          />
        </div>
      )}

      {/* GAMEOVER MODAL */}
      {stage === 'gameover' && gameState?.winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg animate-fadeIn">
          <div className="w-full max-w-lg p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 glow-emerald animate-bounce">
                <Trophy className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                Okey Eli Tamamlandı!
              </span>
              <h2 className="font-display text-3xl font-extrabold text-white">
                {gameState.winner.playerName} Kazandı! 🎉
              </h2>
              <p className="text-sm text-slate-400">
                {gameState.winner.reason}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleStartVsAI}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 text-white font-display font-bold text-base hover:from-amber-600 hover:to-rose-700 shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Yeni El Dağıt
              </button>

              <button
                onClick={onBackToHub}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                Oyun Merkezine Dön
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
