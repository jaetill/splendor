import { describe, expect, it } from 'vitest';
import type { GameState, GemColor } from './types';
import { REGULAR_GEMS } from './types';
import { applyMove, createGame, isLegalMove } from './engine';
import { randomAI } from '../ai/random';

// Drives full games with the random AI to prove the engine is internally consistent:
// tokens are conserved, no state ever goes illegal, and every game terminates with a
// valid winner. createGame and randomAI both draw from Math.random, so seeding it makes
// an entire playthrough deterministic (and these tests reproducible).

const ALL_COLORS: GemColor[] = [...REGULAR_GEMS, 'gray', 'green'];

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Total tokens of each color that should exist for a fresh game (bank, players empty). */
function initialTotals(numPlayers: number): Record<GemColor, number> {
  const regular = numPlayers === 2 ? 4 : numPlayers === 3 ? 5 : 7;
  const green = numPlayers === 2 ? 2 : numPlayers === 3 ? 3 : 4;
  return {
    orange: regular,
    purple: regular,
    red: regular,
    blue: regular,
    yellow: regular,
    gray: 5,
    green,
  };
}

function assertInvariants(s: GameState, totals: Record<GemColor, number>): void {
  const numPlayers = s.players.length;

  expect(s.currentPlayer).toBeGreaterThanOrEqual(0);
  expect(s.currentPlayer).toBeLessThan(numPlayers);

  for (const color of ALL_COLORS) {
    expect(s.gems[color]).toBeGreaterThanOrEqual(0);
    let sum = s.gems[color];
    for (const p of s.players) {
      expect(p.gems[color]).toBeGreaterThanOrEqual(0);
      sum += p.gems[color];
    }
    // Token conservation: nothing created or destroyed across the whole game.
    expect(sum).toBe(totals[color]);
  }

  for (const p of s.players) {
    expect(p.points).toBeGreaterThanOrEqual(0);
    expect(p.reserved.length).toBeLessThanOrEqual(3);
    // Green Time Stone is exempt from the 10-token cap; everything else is capped.
    expect(p.gems.green - (p.hasGreenToken ? 1 : 0)).toBe(0);
    const nonGreen = ALL_COLORS.reduce((n, c) => n + p.gems[c], 0) - p.gems.green;
    expect(nonGreen).toBeLessThanOrEqual(10);
  }
}

function playSeededGame(numPlayers: number, seed: number, maxTurns: number) {
  const original = Math.random;
  Math.random = mulberry32(seed);
  try {
    const totals = initialTotals(numPlayers);
    let s = createGame(numPlayers);
    let turns = 0;
    while (s.phase !== 'ended' && turns < maxTurns) {
      assertInvariants(s, totals);
      const move = randomAI.selectMove(s, s.currentPlayer);
      expect(isLegalMove(s, move)).toBe(true);
      s = applyMove(s, move);
      turns++;
    }
    assertInvariants(s, totals);
    return { final: s, turns };
  } finally {
    Math.random = original;
  }
}

describe('full random playthrough', () => {
  const MAX_TURNS = 10000;

  it.each([
    [2, 1],
    [2, 2],
    [3, 1],
    [3, 2],
    [4, 1],
    [4, 2],
  ])(
    '%i-player game (seed %i) stays consistent, terminates, and has a valid winner',
    (numPlayers, seed) => {
      const { final, turns } = playSeededGame(numPlayers, seed, MAX_TURNS);

      expect(final.phase).toBe('ended');
      expect(turns).toBeLessThan(MAX_TURNS);
      expect(final.winner).not.toBeNull();
      expect(final.winner!).toBeGreaterThanOrEqual(0);
      expect(final.winner!).toBeLessThan(numPlayers);
    },
  );

  it('conserves the green Time Stone (regression: it used to vanish on first tier-3 recruit)', () => {
    // A game where someone recruits a tier-3 must still preserve the green-token total.
    const { final } = playSeededGame(2, 1, MAX_TURNS);
    const greenInPlay = final.gems.green + final.players.reduce((n, p) => n + p.gems.green, 0);
    expect(greenInPlay).toBe(initialTotals(2).green);
  });
});
