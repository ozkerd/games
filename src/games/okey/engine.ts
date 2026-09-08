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

export interface HandAnalysis {
  validMelds: Tile[][];
  highlightedTileIds: Set<string>;
  totalMeldTiles: number;
  meldPoints: number;
  pairsCount: number;
  isClassicWin: boolean;
  canOpen101: boolean;
  discardCandidate: Tile | null;
}

/**
 * Rigorous hand evaluation algorithm:
 * Detects all valid non-overlapping runs, groups, and pairs.
 * Calculates points for 101 and checks for Classic Okey winning condition.
 */
export function evaluateHand(
  tiles: (Tile | null)[],
  okeyTile: { color: TileColor; number: number },
  variant: OkeyVariant
): HandAnalysis {
  const activeTiles = tiles.filter((t): t is Tile => t !== null);
  if (activeTiles.length === 0) {
    return {
      validMelds: [],
      highlightedTileIds: new Set<string>(),
      totalMeldTiles: 0,
      meldPoints: 0,
      pairsCount: 0,
      isClassicWin: false,
      canOpen101: false,
      discardCandidate: null,
    };
  }

  // 1. Find all candidate valid runs (same color sequences >= 3)
  const candidateRuns: Tile[][] = [];
  const colorGroups: Record<TileColor, Tile[]> = { red: [], yellow: [], blue: [], black: [], fake: [] };

  activeTiles.forEach((t) => {
    const effectiveColor = t.isFakeOkey ? okeyTile.color : t.color;
    if (colorGroups[effectiveColor]) {
      colorGroups[effectiveColor].push(t);
    }
  });

  // Find consecutive runs within each color
  Object.values(colorGroups).forEach((cTiles) => {
    if (cTiles.length < 3) return;
    const sorted = [...cTiles].sort((a, b) => {
      const numA = a.isFakeOkey ? okeyTile.number : a.number;
      const numB = b.isFakeOkey ? okeyTile.number : b.number;
      return numA - numB;
    });

    // Subsequence check for 3, 4, 5 consecutive tiles
    for (let len = 3; len <= Math.min(sorted.length, 6); len++) {
      for (let i = 0; i <= sorted.length - len; i++) {
        const sub = sorted.slice(i, i + len);
        if (isValidRun(sub, okeyTile)) {
          candidateRuns.push(sub);
        }
      }
    }
  });

  // 2. Find all candidate valid groups (same number diff color >= 3)
  const candidateGroups: Tile[][] = [];
  const numberGroups: Record<number, Tile[]> = {};

  activeTiles.forEach((t) => {
    const effectiveNumber = t.isFakeOkey ? okeyTile.number : t.number;
    if (!numberGroups[effectiveNumber]) numberGroups[effectiveNumber] = [];
    numberGroups[effectiveNumber].push(t);
  });

  Object.values(numberGroups).forEach((nTiles) => {
    if (nTiles.length < 3) return;
    // Check if distinct colors
    const uniqueByColor: Tile[] = [];
    const seenColors = new Set<TileColor>();

    nTiles.forEach((t) => {
      const col = t.isFakeOkey ? okeyTile.color : t.color;
      if (!seenColors.has(col)) {
        seenColors.add(col);
        uniqueByColor.push(t);
      }
    });

    if (uniqueByColor.length >= 3) {
      if (isValidGroup(uniqueByColor.slice(0, 3), okeyTile)) {
        candidateGroups.push(uniqueByColor.slice(0, 3));
      }
      if (uniqueByColor.length === 4 && isValidGroup(uniqueByColor, okeyTile)) {
        candidateGroups.push(uniqueByColor);
      }
    }
  });

  // 3. Find all candidate pairs
  const candidatePairs: Tile[][] = [];
  const usedPairIds = new Set<string>();

  for (let i = 0; i < activeTiles.length; i++) {
    if (usedPairIds.has(activeTiles[i].id)) continue;
    for (let j = i + 1; j < activeTiles.length; j++) {
      if (usedPairIds.has(activeTiles[j].id)) continue;
      const t1 = activeTiles[i];
      const t2 = activeTiles[j];

      const isSame =
        (t1.isFakeOkey && t2.isFakeOkey) ||
        (!t1.isFakeOkey && !t2.isFakeOkey && t1.color === t2.color && t1.number === t2.number);

      if (isSame) {
        candidatePairs.push([t1, t2]);
        usedPairIds.add(t1.id);
        usedPairIds.add(t2.id);
        break;
      }
    }
  }

  // 4. Greedy selection of maximum non-overlapping melds
  const allCandidates = [...candidateRuns, ...candidateGroups].sort((a, b) => {
    // For 101, prioritize higher point melds; for Classic, prioritize larger melds
    if (variant === '101') {
      return calculateMeldPoints(b, okeyTile) - calculateMeldPoints(a, okeyTile);
    }
    return b.length - a.length;
  });

  const selectedMelds: Tile[][] = [];
  const usedTileIds = new Set<string>();

  allCandidates.forEach((meld) => {
    const isDisjoint = meld.every((t) => !usedTileIds.has(t.id));
    if (isDisjoint) {
      selectedMelds.push(meld);
      meld.forEach((t) => usedTileIds.add(t.id));
    }
  });

  // Calculate points
  const totalMeldPoints = selectedMelds.reduce(
    (sum, meld) => sum + calculateMeldPoints(meld, okeyTile),
    0
  );

  const totalMeldTiles = Array.from(usedTileIds).length;
  const pairsCount = candidatePairs.length;

  // Classic Win criteria:
  // Must have at least 14 tiles in valid melds (or 7 pairs = 14 tiles)
  // and exactly 1 tile left over (the 15th tile to discard into center)
  const isClassicWin =
    (totalMeldTiles >= 14 || pairsCount >= 7) &&
    activeTiles.length >= 14;

  // 101 Open criteria:
  // Must have at least 101 points from valid melds OR at least 5 pairs
  const canOpen101 = variant === '101' && (totalMeldPoints >= 101 || pairsCount >= 5);

  // Find least useful tile as discard candidate (tile not in any meld)
  const leftoverTiles = activeTiles.filter((t) => !usedTileIds.has(t.id));
  const discardCandidate = leftoverTiles.length > 0 ? leftoverTiles[leftoverTiles.length - 1] : activeTiles[activeTiles.length - 1];

  return {
    validMelds: selectedMelds,
    highlightedTileIds: usedTileIds,
    totalMeldTiles,
    meldPoints: totalMeldPoints,
    pairsCount,
    isClassicWin,
    canOpen101,
    discardCandidate,
  };
}

