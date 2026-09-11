import { TavlaGameState, TavlaMove, TavlaHint, PlayerColor } from './types';
import { getAllLegalMoves, applyMove } from './engine';

// Heuristic evaluator from perspective of a given player
function evaluateStateForPlayer(state: TavlaGameState, player: PlayerColor): number {
  const opponent: PlayerColor = player === 'white' ? 'black' : 'white';
  let score = 0;

  // 1. Borne-off reward
  score += state.borneOff[player] * 130;
  score -= state.borneOff[opponent] * 130;

  // 2. Bar penalty / reward
  score -= state.bar[player] * 110;
  score += state.bar[opponent] * 100;

  // 3. Points evaluation
  for (let i = 0; i < 24; i++) {
    const pt = state.points[i];
    const ptIndex = i + 1;

    if (pt.color === player) {
      // Home board points are extra valuable
      const isHome = player === 'white' ? ptIndex <= 6 : ptIndex >= 19;
      if (isHome) score += 30;

      // Gate bonus (safe 2+ checkers)
      if (pt.count >= 2) {
        score += 40;
        if (isHome) score += 30;
      } else if (pt.count === 1) {
        // Exposed blot danger
        score -= 45;
      }

      // Distance towards bearing off
      const progress = player === 'white' ? (25 - ptIndex) : ptIndex;
      score += progress * 1.5;
    } else if (pt.color === opponent) {
      if (pt.count >= 2) {
        score -= 30;
      } else if (pt.count === 1) {
        score += 25; // Targetable enemy blot
      }
    }
  }

  return score;
}

// AI decision for Black bot
export function chooseBestAiMove(state: TavlaGameState): TavlaMove | null {
  const legalMoves = getAllLegalMoves(state, 'black');
  if (legalMoves.length === 0) return null;

  let bestMove: TavlaMove | null = null;
  let bestScore = -Infinity;

  for (const move of legalMoves) {
    const nextState = applyMove(state, move.from, move.to, move.diceUsed);
    let moveScore = evaluateStateForPlayer(nextState, 'black');

    if (move.isHit) moveScore += 160;
    if (move.to === 'off') moveScore += 140;

    moveScore += (Math.random() - 0.5) * 6;

    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestMove = {
        from: move.from,
        to: move.to,
        diceUsed: move.diceUsed,
        isHit: move.isHit,
      };
    }
  }

  return bestMove;
}

// Visual Hint generator for Player 1 (White)
export function getBestMoveHint(state: TavlaGameState): TavlaHint | null {
  const legalMoves = getAllLegalMoves(state, 'white');
  if (legalMoves.length === 0) return null;

  let bestMove: TavlaMove | null = null;
  let bestScore = -Infinity;
  let bestReason = 'Güvenli ilerleme';

  for (const move of legalMoves) {
    const nextState = applyMove(state, move.from, move.to, move.diceUsed);
    let moveScore = evaluateStateForPlayer(nextState, 'white');
    let reason = 'Taşı hedefe doğru güvenli ilerletin';

    if (move.from === 'bar') {
      reason = 'Bardan tahtaya giriş yapın';
      moveScore += 150;
    } else if (move.isHit) {
      reason = 'Rakip açık pulunu vurup bara gönderin! (En Güçlü Hamle)';
      moveScore += 180;
    } else if (move.to === 'off') {
      reason = 'Taşınızı toplayarak zafere bir adım daha yaklaşın!';
      moveScore += 160;
    } else if (typeof move.to === 'number') {
      const targetPoint = state.points[move.to - 1];
      if (targetPoint.color === 'white' && targetPoint.count === 1) {
        reason = `${move.to} numaralı hanede güvenli kapı alın`;
        moveScore += 90;
      }
    }

    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestReason = reason;
      bestMove = move;
    }
  }

  if (!bestMove) return null;

  return {
    from: bestMove.from,
    to: bestMove.to,
    diceUsed: bestMove.diceUsed,
    reason: bestReason,
  };
}
