import type { GameState, Move } from '../game/types';
import { getLegalMoves } from '../game/moves';
import type { AIStrategy, RNG } from './types';

// ── Random strategy ────────────────────────────────────────────────────────────
// The baseline opponent: picks a uniformly random legal move, no evaluation.
// Its job is to exercise the engine and establish a floor that smarter strategies
// (greedy, MCTS) must beat. Deliberately contains zero game logic.

/**
 * Build a random-move AI. Pass a seeded `rng` for deterministic playthroughs;
 * defaults to Math.random.
 */
export function createRandomAI(rng: RNG = Math.random): AIStrategy {
  return {
    name: 'Random',
    selectMove(state: GameState): Move {
      const moves = getLegalMoves(state);
      if (moves.length === 0) {
        // getLegalMoves only returns [] for an ended game — never call the AI then.
        throw new Error('Random AI: no legal moves (is the game over?)');
      }
      return moves[Math.floor(rng() * moves.length)];
    },
  };
}

/** Shared instance using Math.random — fine for play; use createRandomAI(seed) in tests. */
export const randomAI: AIStrategy = createRandomAI();
