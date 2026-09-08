import { Tile, TileColor, OkeyVariant, OkeyPlayerCount, OkeyGameState, Player } from './types';

const COLORS: TileColor[] = ['red', 'yellow', 'blue', 'black'];

/**
 * Creates a standard 106-tile Okey deck
 */
export function createDeck(): Tile[] {
  const deck: Tile[] = [];
  let idCounter = 1;

  // 2 sets of 1-13 in 4 colors = 104 tiles
  for (let copy = 1; copy <= 2; copy++) {
    for (const color of COLORS) {
      for (let num = 1; num <= 13; num++) {
        deck.push({
          id: `tile-${idCounter++}`,
          color,
          number: num,
          isFakeOkey: false,
        });
      }
    }
  }

  // 2 Fake Okey tiles (Sahte Okey)
  deck.push({
    id: `tile-${idCounter++}`,
    color: 'fake',
    number: 0,
    isFakeOkey: true,
  });
  deck.push({
    id: `tile-${idCounter++}`,
    color: 'fake',
    number: 0,
    isFakeOkey: true,
  });

  return shuffle(deck);
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Checks if a tile is the real Okey tile (Joker)
 */
export function isRealOkey(tile: Tile, okeyTile: { color: TileColor; number: number }): boolean {
  if (!tile || tile.isFakeOkey) return false;
  return tile.color === okeyTile.color && tile.number === okeyTile.number;
}

/**
 * Initializes a new game of Okey or 101 Okey
 */
export function initializeGame(
  variant: OkeyVariant,
  playerCount: OkeyPlayerCount,
  mode: 'vs_ai' | 'online',
  playerNames: string[] = []
): OkeyGameState {
  const rawDeck = createDeck();

  // Find a non-fake tile to be the indicator
  const indicatorIndex = rawDeck.findIndex((t) => !t.isFakeOkey);
  const indicator = rawDeck.splice(indicatorIndex, 1)[0];

  // Okey tile is same color as indicator, +1 number (13 wraps to 1)
  const okeyNumber = indicator.number === 13 ? 1 : indicator.number + 1;
  const okeyTile = { color: indicator.color, number: okeyNumber };

  // Dealing:
  // Classic: Player 0 gets 15 tiles, others get 14
  // 101: Player 0 gets 22 tiles, others get 21
  const firstPlayerTileCount = variant === '101' ? 22 : 15;
  const otherPlayerTileCount = variant === '101' ? 21 : 14;

  const players: Player[] = [];
  const defaultNames = ['Sen (Oyuncu 1)', 'Ahmet (Bot)', 'Mehmet (Bot)', 'Ayşe (Bot)'];

  for (let i = 0; i < playerCount; i++) {
    const isFirst = i === 0;
    const tileCount = isFirst ? firstPlayerTileCount : otherPlayerTileCount;
    const dealtTiles = rawDeck.splice(0, tileCount);

    // 30 rack slots (0-14 upper row, 15-29 lower row)
    const rackTiles: (Tile | null)[] = Array(30).fill(null);
    dealtTiles.forEach((tile, idx) => {
      rackTiles[idx] = tile;
    });

    const isBot = mode === 'vs_ai' ? i > 0 : false;
    const name = playerNames[i] || (mode === 'vs_ai' ? defaultNames[i] : `Oyuncu ${i + 1}`);

    players.push({
      id: `p-${i + 1}`,
      name,
      isBot,
      tiles: rackTiles,
      hasOpened: false,
      openScore: 0,
      penaltyScore: 0,
    });
  }

  const discardPiles: Record<number, Tile[]> = {};
  for (let i = 0; i < playerCount; i++) {
    discardPiles[i] = [];
  }

  return {
    variant,
    playerCount,
    mode,
    deck: rawDeck,
    indicator,
    okeyTile,
    players,
    currentTurn: 0, // Player 0 starts
    turnPhase: 'discard', // Player 0 already has extra tile, so they must discard first!
    discardPiles,
    openedSets: [],
    lastDrawnFrom: null,
    winner: null,
  };
}

/**
 * Intelligent auto-sort for Runs (Seri Diz)
 * Groups same-color sequences and same-number groups.
 */
export function autoSortSeries(
  tiles: (Tile | null)[],
  okeyTile: { color: TileColor; number: number }
): (Tile | null)[] {
  const activeTiles = tiles.filter((t): t is Tile => t !== null);
  if (activeTiles.length === 0) return tiles;

  // Separate okeys, fake okeys, and normal tiles
  const okeys: Tile[] = [];
  const normalTiles: Tile[] = [];

  for (const t of activeTiles) {
    if (isRealOkey(t, okeyTile)) {
      okeys.push(t);
    } else {
      normalTiles.push(t);
    }
  }

  // Group by color, then sort by number
  const colorOrder: TileColor[] = ['red', 'yellow', 'blue', 'black', 'fake'];
  normalTiles.sort((a, b) => {
    if (a.color !== b.color) {
      return colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
    }
    return a.number - b.number;
  });

  const sortedList = [...normalTiles, ...okeys];
  const newRack: (Tile | null)[] = Array(30).fill(null);

  // Distribute across upper and lower rack
  sortedList.forEach((t, i) => {
    if (i < 30) newRack[i] = t;
  });

  return newRack;
}

/**
 * Intelligent auto-sort for Pairs (Çift Diz)
 * Matches pairs of identical tiles side by side.
 */
export function autoSortPairs(
  tiles: (Tile | null)[],
  _okeyTile?: { color: TileColor; number: number }
): (Tile | null)[] {
  const activeTiles = tiles.filter((t): t is Tile => t !== null);
  if (activeTiles.length === 0) return tiles;

  const pairs: Tile[] = [];
  const singles: Tile[] = [];
  const used = new Set<string>();

  for (let i = 0; i < activeTiles.length; i++) {
    if (used.has(activeTiles[i].id)) continue;
    let foundPair = false;

    for (let j = i + 1; j < activeTiles.length; j++) {
      if (used.has(activeTiles[j].id)) continue;

      const t1 = activeTiles[i];
      const t2 = activeTiles[j];

      const isSame =
        (t1.isFakeOkey && t2.isFakeOkey) ||
        (!t1.isFakeOkey && !t2.isFakeOkey && t1.color === t2.color && t1.number === t2.number);

      if (isSame) {
        pairs.push(t1, t2);
        used.add(t1.id);
        used.add(t2.id);
        foundPair = true;
        break;
      }
    }

    if (!foundPair) {
      singles.push(activeTiles[i]);
      used.add(activeTiles[i].id);
    }
  }

  // Put pairs first, followed by singles
  const combined = [...pairs, ...singles];
  const newRack: (Tile | null)[] = Array(30).fill(null);

  combined.forEach((t, i) => {
    if (i < 30) newRack[i] = t;
  });

  return newRack;
}

/**
 * Validates whether an array of tiles forms a legal Run (e.g. Red 4-5-6 or 12-13-1)
 */
export function isValidRun(tiles: Tile[], okeyTile: { color: TileColor; number: number }): boolean {
  if (tiles.length < 3) return false;

  // Determine standard color from non-okey tiles
  const nonOkeys = tiles.filter((t) => !isRealOkey(t, okeyTile));
  if (nonOkeys.length === 0) return true; // all jokers

  // Extract effective colors & numbers
  const standardColor = nonOkeys.find((t) => !t.isFakeOkey)?.color || nonOkeys[0].color;
  for (const t of nonOkeys) {
    const effectiveColor = t.isFakeOkey ? okeyTile.color : t.color;
    if (effectiveColor !== standardColor) return false;
  }

  // Check sequence: either ascending (e.g. 5, 6, 7) or 12, 13, 1 wrap
  // Check standard ascending
  let possible = true;
  let okeyCount = tiles.filter((t) => isRealOkey(t, okeyTile)).length;

  for (let i = 0; i < tiles.length - 1; i++) {
    const cur = tiles[i];
    const next = tiles[i + 1];

    if (isRealOkey(cur, okeyTile) || isRealOkey(next, okeyTile)) {
      continue; // okey fills any gap
    }

    const curNum = cur.isFakeOkey ? okeyTile.number : cur.number;
    const nextNum = next.isFakeOkey ? okeyTile.number : next.number;

    // Standard increment or 13 -> 1 at the end
    if (curNum === 13 && nextNum === 1 && i === tiles.length - 2) {
      continue;
    }

    if (nextNum !== curNum + 1) {
      possible = false;
      break;
    }
  }

  return possible || okeyCount >= 1;
}

/**
 * Validates whether an array of tiles forms a legal Group (e.g. Red 7, Blue 7, Black 7)
 */
export function isValidGroup(tiles: Tile[], okeyTile: { color: TileColor; number: number }): boolean {
  if (tiles.length < 3 || tiles.length > 4) return false;

  const nonOkeys = tiles.filter((t) => !isRealOkey(t, okeyTile));
  if (nonOkeys.length === 0) return true;

  const targetNumber = nonOkeys[0].isFakeOkey ? okeyTile.number : nonOkeys[0].number;
  const colorsUsed = new Set<TileColor>();

  for (const t of nonOkeys) {
    const num = t.isFakeOkey ? okeyTile.number : t.number;
    const col = t.isFakeOkey ? okeyTile.color : t.color;

    if (num !== targetNumber) return false;
    if (colorsUsed.has(col)) return false; // duplicate color
    colorsUsed.add(col);
  }

  return true;
}

/**
 * Calculates total point value of tiles in a meld for 101 Okey
 */
export function calculateMeldPoints(
  meld: Tile[],
  okeyTile: { color: TileColor; number: number }
): number {
  return meld.reduce((sum, tile) => {
    if (tile.isFakeOkey) return sum + okeyTile.number;
    return sum + tile.number;
  }, 0);
}

/**
 * AI Bot decision logic for drawing and discarding
 */
export function getBotAction(
  botIndex: number,
  state: OkeyGameState
): { action: 'draw_deck' | 'draw_discard'; tileIndex?: number } | { action: 'discard'; tileSlot: number } {
  const bot = state.players[botIndex];
  const activeTiles = bot.tiles.filter((t): t is Tile => t !== null);

  if (state.turnPhase === 'draw') {
    // Check if the tile discarded by the previous player helps this bot
    const prevPlayerIndex = (botIndex - 1 + state.playerCount) % state.playerCount;
    const prevDiscardPile = state.discardPiles[prevPlayerIndex];
    const topDiscard = prevDiscardPile && prevDiscardPile.length > 0
      ? prevDiscardPile[prevDiscardPile.length - 1]
      : null;

    if (topDiscard) {
      // If discard is the real okey or forms a pair/run with bot's hand
      if (isRealOkey(topDiscard, state.okeyTile)) {
        return { action: 'draw_discard' };
      }

      const hasDirectSynergy = activeTiles.some(
        (t) =>
          (t.color === topDiscard.color && Math.abs(t.number - topDiscard.number) === 1) ||
          (t.number === topDiscard.number && t.color !== topDiscard.color)
      );

      if (hasDirectSynergy && Math.random() < 0.6) {
        return { action: 'draw_discard' };
      }
    }

    return { action: 'draw_deck' };
  } else {
    // Discard phase: Find the least useful tile (avoid discarding Okey or Fake Okey)
    let worstSlot = -1;
    let minScore = Infinity;

    bot.tiles.forEach((t, slot) => {
      if (!t) return;
      if (isRealOkey(t, state.okeyTile)) return; // Never discard Okey unless finishing!

      // Count synergy with other tiles
      let synergy = 0;
      activeTiles.forEach((other) => {
        if (other.id === t.id) return;
        if (other.color === t.color && Math.abs(other.number - t.number) <= 2) synergy += 2;
        if (other.number === t.number) synergy += 2;
      });

      if (t.isFakeOkey) synergy += 10;

      if (synergy < minScore) {
        minScore = synergy;
        worstSlot = slot;
      }
    });

    if (worstSlot === -1) {
      // Find first non-empty slot
      worstSlot = bot.tiles.findIndex((t) => t !== null);
    }

    return { action: 'discard', tileSlot: worstSlot };
  }
}
