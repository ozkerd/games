import { BoardPoint, PlayerColor, TavlaGameState, TavlaMove, WinType } from './types';

// Traditional Turkish Dice Callout Names
export const TURKISH_DICE_NAMES: Record<string, string> = {
  '1-1': 'Hep Yek',
  '2-2': 'Dübara',
  '3-3': 'Dü Se',
  '4-4': 'Dört Cihar',
  '5-5': 'Dübeş',
  '6-6': 'Düşeş',
  '6-5': 'Şeş-Beş',
  '6-4': 'Şeş-i Cihar',
  '6-3': 'Şeş-ü Se',
  '6-2': 'Şeş-i Dü',
  '6-1': 'Şeş-ü Yek',
  '5-4': 'Penc-ü Cihar',
  '5-3': 'Penc-ü Se',
  '5-2': 'Penc-ü Dü (Dübeş)',
  '5-1': 'Penc-ü Yek',
  '4-3': 'Cihar-ü Se',
  '4-2': 'Cihar-ı Dü',
  '4-1': 'Cihar-ü Yek',
  '3-2': 'Seba-i Dü',
  '3-1': 'Se-Yek',
  '2-1': 'Dü-Yek',
};

export function getDiceCallout(d1: number, d2: number): string {
  const high = Math.max(d1, d2);
  const low = Math.min(d1, d2);
  const key = `${high}-${low}`;
  const name = TURKISH_DICE_NAMES[key] || `${high} - ${low}`;
  if (d1 === d2) {
    return `${name}! (${d1}-${d2}) - 4 Hamle!`;
  }
  return `${name} (${d1} - ${d2})`;
}

// Initial 24-point setup: Standard Backgammon / Turkish Tavla
export function getInitialPoints(): BoardPoint[] {
  const points: BoardPoint[] = Array.from({ length: 24 }, (_, i) => ({
    index: i + 1,
    color: null,
    count: 0,
  }));

  // White moves: 24 -> 1. White home board: 1..6
  // Black moves: 1 -> 24. Black home board: 19..24

  // White pieces (15 total)
  points[23] = { index: 24, color: 'white', count: 2 };
  points[12] = { index: 13, color: 'white', count: 5 };
  points[7] = { index: 8, color: 'white', count: 3 };
  points[5] = { index: 6, color: 'white', count: 5 };

  // Black pieces (15 total)
  points[0] = { index: 1, color: 'black', count: 2 };
  points[11] = { index: 12, color: 'black', count: 5 };
  points[16] = { index: 17, color: 'black', count: 3 };
  points[18] = { index: 19, color: 'black', count: 5 };

  return points;
}

export function createInitialGameState(gameMode: 'vs_ai' | 'vs_player' = 'vs_ai'): TavlaGameState {
  return {
    points: getInitialPoints(),
    bar: { white: 0, black: 0 },
    borneOff: { white: 0, black: 0 },
    currentTurn: 'white',
    turnPhase: 'need_roll',
    gameMode,
    diceState: {
      dice: [0, 0],
      remainingMoves: [],
      isRolling: false,
      rollCallout: 'Oyuna başlamak için zar atın!',
      rolledBy: null,
    },
    selectedPoint: null,
    validDestinations: [],
    activeHint: null,
    moveHistory: [],
    winner: null,
    winType: null,
    statusMessage: 'Zar atın ve hamlenizi yapın.',
    isAiThinking: false,
  };
}

// Check if a player is ready to bear off (all pieces are in their home board, none on bar)
export function canPlayerBearOff(state: TavlaGameState, player: PlayerColor): boolean {
  if (state.bar[player] > 0) return false;

  if (player === 'white') {
    // White home: 1 to 6. Any piece outside 1..6?
    for (let i = 6; i < 24; i++) {
      if (state.points[i].color === 'white' && state.points[i].count > 0) {
        return false;
      }
    }
    return true;
  } else {
    // Black home: 19 to 24. Any piece outside 19..24?
    for (let i = 0; i < 18; i++) {
      if (state.points[i].color === 'black' && state.points[i].count > 0) {
        return false;
      }
    }
    return true;
  }
}

// Check if opponent home board is completely closed (all 6 points have 2+ checkers)
export function isOpponentHomeBoardFullyClosed(state: TavlaGameState, player: PlayerColor): boolean {
  const opponent: PlayerColor = player === 'white' ? 'black' : 'white';
  if (player === 'white') {
    // Black's home board is 19 to 24 (indices 18 to 23)
    for (let i = 18; i < 24; i++) {
      const pt = state.points[i];
      if (pt.color !== opponent || pt.count < 2) {
        return false;
      }
    }
    return true;
  } else {
    // White's home board is 1 to 6 (indices 0 to 5)
    for (let i = 0; i < 6; i++) {
      const pt = state.points[i];
      if (pt.color !== opponent || pt.count < 2) {
        return false;
      }
    }
    return true;
  }
}

// Calculate legal destinations for a single checker move using a specific dice value
export function getDestinationForDie(
  state: TavlaGameState,
  player: PlayerColor,
  from: number | 'bar',
  die: number
): { to: number | 'off'; isHit: boolean } | null {
  const opponent: PlayerColor = player === 'white' ? 'black' : 'white';

  if (from === 'bar') {
    // Entering from bar
    const targetIndex = player === 'white' ? 25 - die : die;
    const targetPoint = state.points[targetIndex - 1];

    if (targetPoint.color === opponent && targetPoint.count >= 2) {
      return null; // Blocked by opponent gate
    }

    const isHit = targetPoint.color === opponent && targetPoint.count === 1;
    return { to: targetIndex, isHit };
  }

  // Normal point move
  const targetIndex = player === 'white' ? from - die : from + die;

  if (player === 'white') {
    if (targetIndex < 1) {
      // Trying to bear off
      if (!canPlayerBearOff(state, 'white')) return null;

      if (from === die) {
        // Exact bear off
        return { to: 'off', isHit: false };
      }
      if (targetIndex < 1) {
        // Can only bear off with a die greater than position if no checkers on higher points
        for (let p = from + 1; p <= 6; p++) {
          if (state.points[p - 1].color === 'white' && state.points[p - 1].count > 0) {
            return null; // Must move the higher checker instead
          }
        }
        return { to: 'off', isHit: false };
      }
    }
  } else {
    if (targetIndex > 24) {
      // Trying to bear off
      if (!canPlayerBearOff(state, 'black')) return null;

      const distance = 25 - from;
      if (distance === die) {
        return { to: 'off', isHit: false };
      }
      if (die > distance) {
        // Can only bear off with higher die if no checkers on points farther from bear off (19 to from-1)
        for (let p = 19; p < from; p++) {
          if (state.points[p - 1].color === 'black' && state.points[p - 1].count > 0) {
            return null;
          }
        }
        return { to: 'off', isHit: false };
      }
    }
  }

  // Regular landing on board
  if (targetIndex < 1 || targetIndex > 24) return null;

  const targetPoint = state.points[targetIndex - 1];
  if (targetPoint.color === opponent && targetPoint.count >= 2) {
    return null; // Blocked
  }

  const isHit = targetPoint.color === opponent && targetPoint.count === 1;
  return { to: targetIndex, isHit };
}

// Get all possible valid moves for a selected origin (point or 'bar') with current remaining moves
export function getValidMovesForOrigin(
  state: TavlaGameState,
  player: PlayerColor,
  from: number | 'bar'
): Array<{ to: number | 'off'; diceUsed: number; isHit: boolean }> {
  if (state.bar[player] > 0 && from !== 'bar') {
    // Player has checkers on bar; MUST move from bar first!
    return [];
  }

  if (from !== 'bar') {
    const pt = state.points[from - 1];
    if (pt.color !== player || pt.count <= 0) return [];
  } else {
    if (state.bar[player] <= 0) return [];
  }

  const uniqueDice = Array.from(new Set(state.diceState.remainingMoves));
  const results: Array<{ to: number | 'off'; diceUsed: number; isHit: boolean }> = [];
  const seenTargets = new Set<string>();

  for (const die of uniqueDice) {
    const dest = getDestinationForDie(state, player, from, die);
    if (dest) {
      const key = `${dest.to}-${die}`;
      if (!seenTargets.has(key)) {
        seenTargets.add(key);
        results.push({ to: dest.to, diceUsed: die, isHit: dest.isHit });
      }
    }
  }

  return results;
}

// Check if current player has ANY legal move with the available dice
export function getAllLegalMoves(
  state: TavlaGameState,
  player: PlayerColor
): Array<{ from: number | 'bar'; to: number | 'off'; diceUsed: number; isHit: boolean }> {
  const moves: Array<{ from: number | 'bar'; to: number | 'off'; diceUsed: number; isHit: boolean }> = [];

  if (state.diceState.remainingMoves.length === 0) return [];

  if (state.bar[player] > 0) {
    return getValidMovesForOrigin(state, player, 'bar').map((m) => ({
      from: 'bar' as const,
      ...m,
    }));
  }

  for (let i = 1; i <= 24; i++) {
    if (state.points[i - 1].color === player && state.points[i - 1].count > 0) {
      const pointMoves = getValidMovesForOrigin(state, player, i);
      for (const m of pointMoves) {
        moves.push({ from: i, ...m });
      }
    }
  }

  return moves;
}

// Execute a move on state and return new cloned state
export function applyMove(
  prevState: TavlaGameState,
  from: number | 'bar',
  to: number | 'off',
  diceUsed: number
): TavlaGameState {
  const nextPoints = prevState.points.map((p) => ({ ...p }));
  const nextBar = { ...prevState.bar };
  const nextBorneOff = { ...prevState.borneOff };
  const player = prevState.currentTurn;
  const opponent: PlayerColor = player === 'white' ? 'black' : 'white';
  let isHit = false;

  // 1. Remove from origin
  if (from === 'bar') {
    nextBar[player] = Math.max(0, nextBar[player] - 1);
  } else {
    const fromPt = nextPoints[from - 1];
    fromPt.count -= 1;
    if (fromPt.count <= 0) {
      fromPt.color = null;
      fromPt.count = 0;
    }
  }

  // 2. Add to destination
  if (to === 'off') {
    nextBorneOff[player] += 1;
  } else {
    const toPt = nextPoints[to - 1];
    if (toPt.color === opponent && toPt.count === 1) {
      // HIT!
      isHit = true;
      toPt.color = player;
      toPt.count = 1;
      nextBar[opponent] += 1;
    } else {
      toPt.color = player;
      toPt.count += 1;
    }
  }

  // 3. Consume die from remainingMoves
  const remaining = [...prevState.diceState.remainingMoves];
  const dieIdx = remaining.indexOf(diceUsed);
  if (dieIdx !== -1) {
    remaining.splice(dieIdx, 1);
  }

  const moveRecord: TavlaMove = {
    from,
    to,
    diceUsed,
    isHit,
  };

  // 4. Check for victory
  let winner: PlayerColor | null = null;
  let winType: WinType | null = null;

  if (nextBorneOff[player] >= 15) {
    winner = player;
    // Determine win type:
    const loserBorneOff = nextBorneOff[opponent];
    if (loserBorneOff > 0) {
      winType = 'normal';
    } else {
      // Check if loser still has checkers in winner's home or bar -> Katmerli Mars
      let inWinnerHome = false;
      if (player === 'white') {
        // White home is 1..6
        for (let i = 0; i < 6; i++) {
          if (nextPoints[i].color === opponent && nextPoints[i].count > 0) {
            inWinnerHome = true;
            break;
          }
        }
      } else {
        // Black home is 19..24
        for (let i = 18; i < 24; i++) {
          if (nextPoints[i].color === opponent && nextPoints[i].count > 0) {
            inWinnerHome = true;
            break;
          }
        }
      }

      if (nextBar[opponent] > 0 || inWinnerHome) {
        winType = 'katmerli_mars';
      } else {
        winType = 'mars';
      }
    }
  }

  let autoSelectedPoint: number | 'bar' | null = null;
  let autoValidDests: Array<number | 'off'> = [];

  if (nextBar[player] > 0 && remaining.length > 0) {
    autoSelectedPoint = 'bar';
    const intermediateState: TavlaGameState = {
      ...prevState,
      points: nextPoints,
      bar: nextBar,
      borneOff: nextBorneOff,
      diceState: { ...prevState.diceState, remainingMoves: remaining },
    };
    autoValidDests = getValidMovesForOrigin(intermediateState, player, 'bar').map((m) => m.to);
  }

  return {
    ...prevState,
    points: nextPoints,
    bar: nextBar,
    borneOff: nextBorneOff,
    selectedPoint: autoSelectedPoint,
    validDestinations: autoValidDests,
    diceState: {
      ...prevState.diceState,
      remainingMoves: remaining,
    },
    moveHistory: [moveRecord, ...prevState.moveHistory],
    winner,
    winType,
    statusMessage: isHit ? 'Açık pul vuruldu! Rakip bara gitti.' : 'Hamle yapıldı.',
  };
}
