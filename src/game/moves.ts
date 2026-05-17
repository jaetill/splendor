import type { Card, GameState, GemColor, Move, RegularGem } from './types';
import { REGULAR_GEMS } from './types';
import { isLegalMove } from './engine';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Compute minimum payment for a card (regular gems first, gray as wildcard). */
function canAfford(
  card: Card,
  playerGems: Record<GemColor, number>,
  playerBonuses: Record<RegularGem, number>,
): boolean {
  let grayNeeded = 0;
  for (const color of REGULAR_GEMS) {
    const owed = Math.max(0, (card.cost[color] ?? 0) - (playerBonuses[color] ?? 0));
    grayNeeded += Math.max(0, owed - (playerGems[color] ?? 0));
  }
  return grayNeeded <= (playerGems.gray ?? 0);
}

// ── Take-3 moves ─────────────────────────────────────────────────────────────

function generateTake3Moves(state: GameState): Move[] {
  const bank = state.gems;
  const player = state.players[state.currentPlayer];
  const available = REGULAR_GEMS.filter((g) => bank[g] >= 1);

  const nonGreen =
    Object.values(player.gems).reduce((a, b) => a + b, 0) - (player.hasGreenToken ? 1 : 0);

  const moves: Move[] = [];

  if (available.length >= 3 && nonGreen + 3 <= 10) {
    // Full 3-color combinations
    for (let i = 0; i < available.length - 2; i++)
      for (let j = i + 1; j < available.length - 1; j++)
        for (let k = j + 1; k < available.length; k++)
          moves.push({ type: 'take3', gems: [available[i], available[j], available[k]] });
  } else if (available.length === 2 && nonGreen + 2 <= 10) {
    // Only 2 colors available — must take both
    moves.push({ type: 'take3', gems: [available[0], available[1]] });
  } else if (available.length === 1 && nonGreen + 1 <= 10) {
    // Only 1 color available
    moves.push({ type: 'take3', gems: [available[0]] });
  }

  return moves;
}

// ── Take-2 moves ─────────────────────────────────────────────────────────────

function generateTake2Moves(state: GameState): Move[] {
  const bank = state.gems;
  const player = state.players[state.currentPlayer];
  const nonGreen =
    Object.values(player.gems).reduce((a, b) => a + b, 0) - (player.hasGreenToken ? 1 : 0);

  if (nonGreen + 2 > 10) return [];
  return REGULAR_GEMS.filter((g) => bank[g] >= 4).map((gem) => ({ type: 'take2' as const, gem }));
}

// ── Reserve moves ─────────────────────────────────────────────────────────────

function generateReserveMoves(state: GameState): Move[] {
  const player = state.players[state.currentPlayer];
  if (player.reserved.length >= 3) return [];

  const moves: Move[] = [];

  for (const tier of ['tier1', 'tier2', 'tier3'] as const) {
    for (const card of state.board[tier]) {
      moves.push({ type: 'reserveBoard', card });
    }
  }

  for (const t of [1, 2, 3] as const) {
    const tier = `tier${t}` as 'tier1' | 'tier2' | 'tier3';
    if (state.decks[tier].length > 0) {
      moves.push({ type: 'reserveDeck', tier: t });
    }
  }

  return moves;
}

// ── Recruit moves ─────────────────────────────────────────────────────────────

function generateRecruitMoves(state: GameState): Move[] {
  const player = state.players[state.currentPlayer];

  const candidates: Card[] = [
    ...state.board.tier1,
    ...state.board.tier2,
    ...state.board.tier3,
    ...player.reserved,
  ];

  return candidates
    .filter((card) => canAfford(card, player.gems, player.bonuses))
    .filter((card) => isLegalMove(state, { type: 'recruit', card }))
    .map((card) => ({ type: 'recruit' as const, card }));
}

// ── getLegalMoves ─────────────────────────────────────────────────────────────

/**
 * Return all legal moves for the current player.
 * `pass` is appended only when no other moves are available.
 */
export function getLegalMoves(state: GameState): Move[] {
  if (state.phase === 'ended') return [];

  const moves: Move[] = [
    ...generateTake3Moves(state),
    ...generateTake2Moves(state),
    ...generateReserveMoves(state),
    ...generateRecruitMoves(state),
  ];

  if (moves.length === 0) moves.push({ type: 'pass' });
  return moves;
}
