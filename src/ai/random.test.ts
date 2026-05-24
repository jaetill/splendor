import { describe, expect, it } from 'vitest';
import type { GameState, GemSupply, Player, RegularGem } from '../game/types';
import { isLegalMove } from '../game/engine';
import { getLegalMoves } from '../game/moves';
import { createRandomAI, randomAI } from './random';

// ── Builders (kept self-contained, mirroring engine.test.ts) ──────────────────

function gems(partial: Partial<GemSupply> = {}): GemSupply {
  return { orange: 0, purple: 0, red: 0, blue: 0, yellow: 0, gray: 0, green: 0, ...partial };
}

function bonuses(partial: Partial<Record<RegularGem, number>> = {}): Record<RegularGem, number> {
  return { orange: 0, purple: 0, red: 0, blue: 0, yellow: 0, ...partial };
}

function player(overrides: Partial<Player> = {}): Player {
  return {
    gems: gems(),
    bonuses: bonuses(),
    recruited: [],
    reserved: [],
    locations: [],
    points: 0,
    avengersTagCount: 0,
    hasGreenToken: false,
    ...overrides,
  };
}

function state(overrides: Partial<GameState> = {}): GameState {
  return {
    players: [player(), player()],
    currentPlayer: 0,
    gems: gems({ orange: 4, purple: 4, red: 4, blue: 4, yellow: 4, gray: 5, green: 2 }),
    decks: { tier1: [], tier2: [], tier3: [] },
    board: { tier1: [], tier2: [], tier3: [] },
    locations: [],
    avengersAssembleTile: null,
    phase: 'playing',
    lastRoundTriggerPlayer: null,
    winner: null,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('random AI', () => {
  it('always returns a legal move', () => {
    const ai = createRandomAI();
    const s = state();
    for (let i = 0; i < 100; i++) {
      expect(isLegalMove(s, ai.selectMove(s, 0))).toBe(true);
    }
  });

  it('only ever returns a move from the legal-move set', () => {
    const ai = createRandomAI();
    const s = state();
    const legal = getLegalMoves(s);
    const move = ai.selectMove(s, 0);
    expect(legal).toContainEqual(move);
  });

  it('returns the forced pass when passing is the only legal move', () => {
    const ai = createRandomAI();
    const s = state({
      gems: gems({ gray: 0 }),
      board: { tier1: [], tier2: [], tier3: [] },
      decks: { tier1: [], tier2: [], tier3: [] },
    });
    expect(ai.selectMove(s, 0)).toEqual({ type: 'pass' });
  });

  it('is deterministic for a fixed RNG and explores the whole move set as the RNG sweeps', () => {
    const s = state();
    const legal = getLegalMoves(s);
    // A constant rng=0 always picks index 0.
    const first = createRandomAI(() => 0);
    expect(first.selectMove(s, 0)).toEqual(legal[0]);
    // Sweeping the RNG across [0,1) should be able to reach the last move.
    const last = createRandomAI(() => 0.999999);
    expect(last.selectMove(s, 0)).toEqual(legal[legal.length - 1]);
  });

  it('throws if asked to move with no legal moves (ended game)', () => {
    const ai = createRandomAI();
    const ended = state({ phase: 'ended' });
    expect(() => ai.selectMove(ended, 0)).toThrow();
  });

  it('exposes a shared default instance', () => {
    expect(randomAI.name).toBe('Random');
  });
});
