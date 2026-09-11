import { TavlaGameState, TavlaMove } from './types';
import { getAllLegalMoves, applyMove } from './engine';

// Heuristic evaluator for AI move decision
function evaluateState(state: TavlaGameState): number {
  let score = 0;

  // 1. Borne-off checkers (huge reward)
  score += state.borneOff.black * 120;
  score -= state.borneOff.white * 120;

  // 2. Bar penalty / reward
  score -= state.bar.black * 100;
  score += state.bar.white * 90;

  // 3. Evaluate points
  for (let i = 0; i < 24; i++) {
    const pt = state.points[i];
    if (pt.color === 'black') {
      // Points inside home board (19 to 24) are valuable
      if (i >= 18) {
        score += 25;
      }
      // Having a gate (safe 2+ checkers)
      if (pt.count >= 2) {
        score += 35;
        if (i >= 18) score += 25; // Home board gate is extra valuable
      } else if (pt.count === 1) {
        // Exposed blot risk
        score -= 40;
      }
      // Progressive distance towards home
      score += (i + 1) * 1.5;
    } else if (pt.color === 'white') {
      if (pt.count >= 2) {
        score -= 30;
      } else if (pt.count === 1) {
        // Exposed opponent blot
        score += 20;
      }
    }
  }

  return score;
}

export function chooseBestAiMove(state: TavlaGameState): TavlaMove | null {
  const legalMoves = getAllLegalMoves(state, 'black');
  if (legalMoves.length === 0) return null;

  let bestMove: TavlaMove | null = null;
  let bestScore = -Infinity;

  for (const move of legalMoves) {
    const nextState = applyMove(state, move.from, move.to, move.diceUsed);
    let moveScore = evaluateState(nextState);

    // Direct bonuses for tactical actions
    if (move.isHit) {
      moveScore += 160; // Hitting opponent is prime objective
    }
    if (move.to === 'off') {
      moveScore += 140; // Bearing off is high priority
    }

    // Small random jitter to make play feel natural and non-repetitive
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
