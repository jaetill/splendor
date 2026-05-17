import { describe, expect, it } from 'vitest';
import type { Card, GameState, GemSupply, Move, Player, RegularGem } from './types';
import { getLegalMoves } from './moves';

// ── Builders (duplicated from engine.test.ts on purpose — keep test files self-contained) ──

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

function card(overrides: Partial<Card> & { id: string; tier: 1 | 2 | 3 }): Card {
  return { points: 0, bonus: 'blue', cost: {}, avengersTagCount: 0, ...overrides };
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

function count(moves: Move[], type: Move['type']): number {
  return moves.filter((m) => m.type === type).length;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('getLegalMoves — take3', () => {
  it('enumerates every distinct 3-color combination when 5 colors are available (C(5,3) = 10)', () => {
    const s = state();
    expect(count(getLegalMoves(s), 'take3')).toBe(10);
  });

  it('enumerates C(4,3) = 4 combinations when 4 colors are available', () => {
    const s = state({ gems: gems({ orange: 1, purple: 1, red: 1, blue: 1, gray: 5 }) });
    expect(count(getLegalMoves(s), 'take3')).toBe(4);
  });

  it('falls back to exactly one 2-color take when only 2 colors are available', () => {
    const s = state({ gems: gems({ orange: 1, purple: 1, gray: 5 }) });
    const take3s = getLegalMoves(s).filter(
      (m): m is Extract<Move, { type: 'take3' }> => m.type === 'take3',
    );
    expect(take3s).toHaveLength(1);
    expect(take3s[0].gems.sort()).toEqual(['orange', 'purple']);
  });

  it('falls back to a single 1-color take when only 1 color is available', () => {
    const s = state({ gems: gems({ red: 1, gray: 5 }) });
    const take3s = getLegalMoves(s).filter(
      (m): m is Extract<Move, { type: 'take3' }> => m.type === 'take3',
    );
    expect(take3s).toHaveLength(1);
    expect(take3s[0].gems).toEqual(['red']);
  });

  it('emits no take3 moves when the 10-gem cap would be exceeded', () => {
    const s = state({
      players: [
        player({ gems: gems({ orange: 4, purple: 4 }) }), // 8 held, +3 would exceed 10
        player(),
      ],
    });
    expect(count(getLegalMoves(s), 'take3')).toBe(0);
  });

  it('excludes the green Time Stone from the 10-gem cap', () => {
    const s = state({
      players: [
        player({
          gems: gems({ orange: 3, purple: 3, green: 1 }), // 6 regular + 1 green
          hasGreenToken: true,
        }),
        player(),
      ],
    });
    // 6 non-green + 3 = 9, still within cap
    expect(count(getLegalMoves(s), 'take3')).toBeGreaterThan(0);
  });
});

describe('getLegalMoves — take2', () => {
  it('emits take2 only for colors with ≥4 in the bank', () => {
    const s = state({ gems: gems({ orange: 4, purple: 3, red: 5, gray: 5 }) });
    const take2s = getLegalMoves(s).filter(
      (m): m is Extract<Move, { type: 'take2' }> => m.type === 'take2',
    );
    expect(take2s.map((m) => m.gem).sort()).toEqual(['orange', 'red']);
  });

  it('emits no take2 when the 10-gem cap would be exceeded', () => {
    const s = state({
      players: [player({ gems: gems({ orange: 9 }) }), player()],
    });
    expect(count(getLegalMoves(s), 'take2')).toBe(0);
  });
});

describe('getLegalMoves — reserve', () => {
  it('emits one reserveBoard per face-up card and one reserveDeck per non-empty deck', () => {
    const c1 = card({ id: 'a', tier: 1 });
    const c2 = card({ id: 'b', tier: 2 });
    const c3 = card({ id: 'c', tier: 3 });
    const s = state({
      board: { tier1: [c1], tier2: [c2], tier3: [c3] },
      decks: {
        tier1: [card({ id: 'd1', tier: 1 })],
        tier2: [],
        tier3: [card({ id: 'd3', tier: 3 })],
      },
    });
    const moves = getLegalMoves(s);
    expect(count(moves, 'reserveBoard')).toBe(3);
    expect(count(moves, 'reserveDeck')).toBe(2);
  });

  it('emits no reserve moves when the player is already holding 3 reserved cards', () => {
    const s = state({
      board: { tier1: [card({ id: 'x', tier: 1 })], tier2: [], tier3: [] },
      decks: { tier1: [card({ id: 'd', tier: 1 })], tier2: [], tier3: [] },
      players: [
        player({
          reserved: [
            card({ id: 'r1', tier: 1 }),
            card({ id: 'r2', tier: 1 }),
            card({ id: 'r3', tier: 1 }),
          ],
        }),
        player(),
      ],
    });
    const moves = getLegalMoves(s);
    expect(count(moves, 'reserveBoard')).toBe(0);
    expect(count(moves, 'reserveDeck')).toBe(0);
  });
});

describe('getLegalMoves — recruit', () => {
  it('lists affordable cards from board and reserved hand', () => {
    const affordable = card({ id: 'cheap', tier: 1, cost: { red: 1 } });
    const tooExpensive = card({ id: 'expensive', tier: 1, cost: { red: 5 } });
    const reservedAffordable = card({ id: 'reserved-cheap', tier: 2, cost: {} });
    const s = state({
      board: { tier1: [affordable, tooExpensive], tier2: [], tier3: [] },
      players: [player({ gems: gems({ red: 1 }), reserved: [reservedAffordable] }), player()],
    });
    const recruits = getLegalMoves(s).filter(
      (m): m is Extract<Move, { type: 'recruit' }> => m.type === 'recruit',
    );
    const ids = recruits.map((m) => m.card.id).sort();
    expect(ids).toEqual(['cheap', 'reserved-cheap']);
  });
});

describe('getLegalMoves — pass + ended', () => {
  it('emits pass only when no other move is available', () => {
    // No cards, no gems anywhere, no reserved
    const s = state({
      gems: gems({ gray: 0 }),
      board: { tier1: [], tier2: [], tier3: [] },
      decks: { tier1: [], tier2: [], tier3: [] },
    });
    expect(getLegalMoves(s)).toEqual([{ type: 'pass' }]);
  });

  it('does not include pass when other moves exist', () => {
    const s = state(); // standard 2p starting bank
    expect(count(getLegalMoves(s), 'pass')).toBe(0);
  });

  it('returns no moves once the game has ended', () => {
    const s = state({ phase: 'ended' });
    expect(getLegalMoves(s)).toEqual([]);
  });
});
