import type { GameState, Move } from '../game/types';

// ── AI strategy interface ──────────────────────────────────────────────────────
// Every opponent (random → greedy → MCTS) implements this. The UI picks a move by
// calling selectMove for the current player; the engine validates and applies it.
//
// playerIndex is always state.currentPlayer today, but it is passed explicitly so
// later strategies can reason about "me vs. opponents" without re-deriving it.

export interface AIStrategy {
  /** Display name for the strategy (e.g. shown in an opponent picker). */
  readonly name: string;
  /** Choose one legal move for the given player. Must return a move the engine accepts. */
  selectMove(state: GameState, playerIndex: number): Move;
}

/** Pseudo-random source returning a float in [0, 1). Injectable for deterministic tests. */
export type RNG = () => number;
