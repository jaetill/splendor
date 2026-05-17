import { describe, expect, it } from 'vitest';
import type { Card, GameState, GemSupply, Location, Player, RegularGem } from './types';
import { applyMove, createGame, isLegalMove } from './engine';

// ── Builders ──────────────────────────────────────────────────────────────────
// Direct GameState construction so tests bypass shuffle non-determinism.

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
  return {
    points: 0,
    bonus: 'blue',
    cost: {},
    avengersTagCount: 0,
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

// ── createGame ────────────────────────────────────────────────────────────────

describe('createGame', () => {
  it('rejects player counts outside 2–4', () => {
    expect(() => createGame(1)).toThrow();
    expect(() => createGame(5)).toThrow();
  });

  it.each([
    [2, 4, 2],
    [3, 5, 3],
    [4, 7, 4],
  ])('seeds bank correctly for %i players', (numPlayers, regular, green) => {
    const g = createGame(numPlayers);
    for (const color of ['orange', 'purple', 'red', 'blue', 'yellow'] as RegularGem[]) {
      expect(g.gems[color]).toBe(regular);
    }
    expect(g.gems.gray).toBe(5);
    expect(g.gems.green).toBe(green);
    expect(g.locations).toHaveLength(numPlayers);
    expect(g.players).toHaveLength(numPlayers);
  });

  it('deals 4 face-up cards per tier', () => {
    const g = createGame(3);
    expect(g.board.tier1).toHaveLength(4);
    expect(g.board.tier2).toHaveLength(4);
    expect(g.board.tier3).toHaveLength(4);
  });

  it('starts at phase=playing with player 0 to move and no winner', () => {
    const g = createGame(2);
    expect(g.phase).toBe('playing');
    expect(g.currentPlayer).toBe(0);
    expect(g.winner).toBeNull();
    expect(g.avengersAssembleTile).toBeNull();
  });
});

// ── isLegalMove: take3 ────────────────────────────────────────────────────────

describe('isLegalMove — take3', () => {
  it('accepts 3 distinct colors when bank has them', () => {
    const s = state();
    expect(isLegalMove(s, { type: 'take3', gems: ['orange', 'purple', 'red'] })).toBe(true);
  });

  it('rejects duplicate colors in take3', () => {
    const s = state();
    expect(isLegalMove(s, { type: 'take3', gems: ['red', 'red', 'blue'] })).toBe(false);
  });

  it('rejects taking a color whose bank pile is empty', () => {
    const s = state({ gems: gems({ orange: 0, purple: 4, red: 4, blue: 4, yellow: 4, gray: 5 }) });
    expect(isLegalMove(s, { type: 'take3', gems: ['orange', 'purple', 'red'] })).toBe(false);
  });

  it('requires picking 3 when 3+ colors are available (no partial take)', () => {
    const s = state();
    expect(isLegalMove(s, { type: 'take3', gems: ['orange', 'purple'] })).toBe(false);
  });

  it('allows a 2-color take only when exactly 2 colors are available', () => {
    const s = state({
      gems: gems({ orange: 2, purple: 2, gray: 5 }),
    });
    expect(isLegalMove(s, { type: 'take3', gems: ['orange', 'purple'] })).toBe(true);
  });

  it('enforces the 10-gem cap (excluding the green Time Stone)', () => {
    const s = state({
      players: [
        player({ gems: gems({ orange: 4, purple: 4 }) }), // already holds 8
        player(),
      ],
    });
    expect(isLegalMove(s, { type: 'take3', gems: ['red', 'blue', 'yellow'] })).toBe(false);
  });
});

// ── isLegalMove: take2 ────────────────────────────────────────────────────────

describe('isLegalMove — take2', () => {
  it('requires the bank to hold ≥4 of that color', () => {
    const s = state({ gems: gems({ red: 3, gray: 5 }) });
    expect(isLegalMove(s, { type: 'take2', gem: 'red' })).toBe(false);
  });

  it('accepts when the bank holds exactly 4', () => {
    const s = state({ gems: gems({ red: 4, gray: 5 }) });
    expect(isLegalMove(s, { type: 'take2', gem: 'red' })).toBe(true);
  });
});

// ── isLegalMove: reserve ──────────────────────────────────────────────────────

describe('isLegalMove — reserve', () => {
  it('rejects reserveBoard once 3 cards are already reserved', () => {
    const target = card({ id: 'k', tier: 1 });
    const s = state({
      board: { tier1: [target], tier2: [], tier3: [] },
      players: [
        player({
          reserved: [
            card({ id: 'a', tier: 1 }),
            card({ id: 'b', tier: 1 }),
            card({ id: 'c', tier: 1 }),
          ],
        }),
        player(),
      ],
    });
    expect(isLegalMove(s, { type: 'reserveBoard', card: target })).toBe(false);
  });

  it('rejects reserveBoard for a card not on the board', () => {
    const target = card({ id: 'ghost', tier: 1 });
    const s = state({ board: { tier1: [], tier2: [], tier3: [] } });
    expect(isLegalMove(s, { type: 'reserveBoard', card: target })).toBe(false);
  });

  it('rejects reserveDeck when the deck is empty', () => {
    const s = state({ decks: { tier1: [], tier2: [], tier3: [] } });
    expect(isLegalMove(s, { type: 'reserveDeck', tier: 1 })).toBe(false);
  });
});

// ── isLegalMove: recruit ──────────────────────────────────────────────────────

describe('isLegalMove — recruit', () => {
  it('rejects a card that is neither on the board nor reserved', () => {
    const target = card({ id: 'ghost', tier: 1, cost: { red: 1 } });
    const s = state({ players: [player({ gems: gems({ red: 1 }) }), player()] });
    expect(isLegalMove(s, { type: 'recruit', card: target })).toBe(false);
  });

  it('rejects a card the player cannot afford', () => {
    const target = card({ id: 'pricey', tier: 1, cost: { red: 5 } });
    const s = state({
      board: { tier1: [target], tier2: [], tier3: [] },
      players: [player({ gems: gems({ red: 1, gray: 1 }) }), player()],
    });
    expect(isLegalMove(s, { type: 'recruit', card: target })).toBe(false);
  });

  it('accepts a card the player can pay for with regular gems', () => {
    const target = card({ id: 'cheap', tier: 1, cost: { red: 1 } });
    const s = state({
      board: { tier1: [target], tier2: [], tier3: [] },
      players: [player({ gems: gems({ red: 1 }) }), player()],
    });
    expect(isLegalMove(s, { type: 'recruit', card: target })).toBe(true);
  });

  it('accepts when bonuses cover the cost without spending any gems', () => {
    const target = card({ id: 'free', tier: 1, cost: { red: 2 } });
    const s = state({
      board: { tier1: [target], tier2: [], tier3: [] },
      players: [player({ bonuses: bonuses({ red: 2 }) }), player()],
    });
    expect(isLegalMove(s, { type: 'recruit', card: target })).toBe(true);
  });

  it('accepts when gray wildcards make up the shortfall', () => {
    const target = card({ id: 'wild', tier: 1, cost: { red: 3 } });
    const s = state({
      board: { tier1: [target], tier2: [], tier3: [] },
      players: [player({ gems: gems({ red: 1, gray: 2 }) }), player()],
    });
    expect(isLegalMove(s, { type: 'recruit', card: target })).toBe(true);
  });
});

// ── applyMove: take3 / take2 ──────────────────────────────────────────────────

describe('applyMove — take3 / take2', () => {
  it('moves gems from bank to player on take3 and advances turn', () => {
    const before = state();
    const after = applyMove(before, { type: 'take3', gems: ['orange', 'purple', 'red'] });
    expect(after.players[0].gems.orange).toBe(1);
    expect(after.players[0].gems.purple).toBe(1);
    expect(after.players[0].gems.red).toBe(1);
    expect(after.gems.orange).toBe(3);
    expect(after.currentPlayer).toBe(1);
  });

  it('does not mutate the input state', () => {
    const before = state();
    const snapshot = JSON.parse(JSON.stringify(before));
    applyMove(before, { type: 'take3', gems: ['orange', 'purple', 'red'] });
    expect(before).toEqual(snapshot);
  });

  it('moves 2 gems on take2', () => {
    const before = state();
    const after = applyMove(before, { type: 'take2', gem: 'blue' });
    expect(after.players[0].gems.blue).toBe(2);
    expect(after.gems.blue).toBe(2);
  });

  it('throws on an illegal move', () => {
    const s = state({ gems: gems({ gray: 5 }) });
    expect(() => applyMove(s, { type: 'take2', gem: 'red' })).toThrow();
  });
});

// ── applyMove: reserve ───────────────────────────────────────────────────────

describe('applyMove — reserve', () => {
  it('reserveBoard moves the card, refills from deck, and grants a gray gem', () => {
    const target = card({ id: 'target', tier: 1 });
    const refill = card({ id: 'refill', tier: 1 });
    const before = state({
      board: { tier1: [target], tier2: [], tier3: [] },
      decks: { tier1: [refill], tier2: [], tier3: [] },
    });
    const after = applyMove(before, { type: 'reserveBoard', card: target });
    expect(after.players[0].reserved).toEqual([target]);
    expect(after.board.tier1).toEqual([refill]);
    expect(after.players[0].gems.gray).toBe(1);
    expect(after.gems.gray).toBe(4);
  });

  it('reserveBoard skips the gray grant when the bank is out of gray', () => {
    const target = card({ id: 'target', tier: 1 });
    const before = state({
      board: { tier1: [target], tier2: [], tier3: [] },
      gems: gems({ gray: 0 }),
    });
    const after = applyMove(before, { type: 'reserveBoard', card: target });
    expect(after.players[0].gems.gray).toBe(0);
  });

  it('reserveDeck pulls the top of the deck into the hand', () => {
    const top = card({ id: 'top', tier: 2 });
    const second = card({ id: 'second', tier: 2 });
    const before = state({ decks: { tier1: [], tier2: [top, second], tier3: [] } });
    const after = applyMove(before, { type: 'reserveDeck', tier: 2 });
    expect(after.players[0].reserved).toEqual([top]);
    expect(after.decks.tier2).toEqual([second]);
  });
});

// ── applyMove: recruit ───────────────────────────────────────────────────────

describe('applyMove — recruit', () => {
  it('pays regular gems first and refunds them to the bank', () => {
    const target = card({ id: 'c', tier: 1, points: 1, bonus: 'blue', cost: { red: 2 } });
    const before = state({
      board: { tier1: [target], tier2: [], tier3: [] },
      players: [player({ gems: gems({ red: 2 }) }), player()],
      gems: gems({ red: 0, gray: 5 }),
    });
    const after = applyMove(before, { type: 'recruit', card: target });
    expect(after.players[0].gems.red).toBe(0);
    expect(after.players[0].bonuses.blue).toBe(1);
    expect(after.players[0].points).toBe(1);
    expect(after.gems.red).toBe(2);
  });

  it('spends gray as wildcard only after regular gems are exhausted', () => {
    const target = card({ id: 'c', tier: 1, cost: { red: 3 } });
    const before = state({
      board: { tier1: [target], tier2: [], tier3: [] },
      players: [player({ gems: gems({ red: 1, gray: 2 }) }), player()],
    });
    const after = applyMove(before, { type: 'recruit', card: target });
    expect(after.players[0].gems.red).toBe(0);
    expect(after.players[0].gems.gray).toBe(0);
    expect(after.gems.gray).toBe(7); // 5 bank + 2 refunded
  });

  it('recruits from reserved hand without touching the board', () => {
    const reserved = card({ id: 'r', tier: 1, cost: {} });
    const before = state({
      players: [player({ reserved: [reserved] }), player()],
    });
    const after = applyMove(before, { type: 'recruit', card: reserved });
    expect(after.players[0].recruited).toEqual([reserved]);
    expect(after.players[0].reserved).toEqual([]);
  });

  it('grants the green Time Stone on first tier-3 recruit', () => {
    const target = card({ id: 't3', tier: 3, cost: {} });
    const before = state({ board: { tier1: [], tier2: [], tier3: [target] } });
    const after = applyMove(before, { type: 'recruit', card: target });
    expect(after.players[0].hasGreenToken).toBe(true);
    expect(after.gems.green).toBe(1);
  });

  it('does not grant a second green token on a later tier-3 recruit', () => {
    const target = card({ id: 't3b', tier: 3, cost: {} });
    const before = state({
      board: { tier1: [], tier2: [], tier3: [target] },
      players: [player({ hasGreenToken: true }), player()],
      gems: gems({ green: 2 }),
    });
    const after = applyMove(before, { type: 'recruit', card: target });
    expect(after.gems.green).toBe(2); // unchanged
  });

  it('auto-claims a location whose bonus requirements are met', () => {
    const loc: Location = { id: 'loc', points: 3, requires: { blue: 1 } };
    const target = card({ id: 'c', tier: 1, bonus: 'blue', cost: {} });
    const before = state({
      board: { tier1: [target], tier2: [], tier3: [] },
      locations: [loc],
    });
    const after = applyMove(before, { type: 'recruit', card: target });
    expect(after.players[0].locations).toEqual([loc]);
    expect(after.locations).toEqual([]);
    expect(after.players[0].points).toBe(3);
  });

  it('claims at most one location per turn even when multiple qualify', () => {
    const loc1: Location = { id: 'a', points: 3, requires: { blue: 1 } };
    const loc2: Location = { id: 'b', points: 3, requires: { blue: 1 } };
    const target = card({ id: 'c', tier: 1, bonus: 'blue', cost: {} });
    const before = state({
      board: { tier1: [target], tier2: [], tier3: [] },
      locations: [loc1, loc2],
    });
    const after = applyMove(before, { type: 'recruit', card: target });
    expect(after.players[0].locations).toHaveLength(1);
    expect(after.locations).toHaveLength(1);
  });

  it('awards the Avengers Assemble tile to the first player to reach 3 tags', () => {
    const target = card({ id: 'c', tier: 1, avengersTagCount: 1, cost: {} });
    const before = state({
      board: { tier1: [target], tier2: [], tier3: [] },
      players: [player({ avengersTagCount: 2 }), player()],
    });
    const after = applyMove(before, { type: 'recruit', card: target });
    expect(after.avengersAssembleTile).toBe(0);
  });

  it('lets the current Avengers holder keep the tile on a tie', () => {
    const target = card({ id: 'c', tier: 1, avengersTagCount: 1, cost: {} });
    const before = state({
      board: { tier1: [target], tier2: [], tier3: [] },
      players: [player({ avengersTagCount: 2 }), player({ avengersTagCount: 3 })],
      avengersAssembleTile: 1,
    });
    const after = applyMove(before, { type: 'recruit', card: target });
    expect(after.avengersAssembleTile).toBe(1);
  });

  it('transfers the Avengers tile when a challenger exceeds the holder', () => {
    const target = card({ id: 'c', tier: 1, avengersTagCount: 2, cost: {} });
    const before = state({
      board: { tier1: [target], tier2: [], tier3: [] },
      players: [player({ avengersTagCount: 2 }), player({ avengersTagCount: 3 })],
      avengersAssembleTile: 1,
    });
    const after = applyMove(before, { type: 'recruit', card: target });
    expect(after.avengersAssembleTile).toBe(0);
  });
});

// ── Phase transitions & win detection ─────────────────────────────────────────

describe('phase transitions', () => {
  function fullyEquippedPlayer(points: number, overrides: Partial<Player> = {}): Player {
    return player({
      points,
      hasGreenToken: true,
      bonuses: bonuses({ orange: 1, purple: 1, red: 1, blue: 1, yellow: 1 }),
      ...overrides,
    });
  }

  it('rejects any move when phase is ended', () => {
    const s = state({ phase: 'ended' });
    expect(isLegalMove(s, { type: 'pass' })).toBe(false);
  });

  it('flips into lastRound when the leader hits the win condition', () => {
    const target = card({ id: 'win', tier: 1, points: 1, bonus: 'orange', cost: {} });
    const before = state({
      board: { tier1: [target], tier2: [], tier3: [] },
      players: [
        fullyEquippedPlayer(15, { bonuses: bonuses({ purple: 1, red: 1, blue: 1, yellow: 1 }) }),
        player(),
      ],
    });
    const after = applyMove(before, { type: 'recruit', card: target });
    expect(after.phase).toBe('lastRound');
    expect(after.lastRoundTriggerPlayer).toBe(0);
  });

  it('ends the game after every player has played the final round', () => {
    const s = state({
      phase: 'lastRound',
      lastRoundTriggerPlayer: 0,
      currentPlayer: 1,
      players: [fullyEquippedPlayer(16), player()],
    });
    const after = applyMove(s, { type: 'pass' });
    expect(after.phase).toBe('ended');
    expect(after.winner).toBe(0);
  });

  it('picks the higher-points eligible player as winner', () => {
    const s = state({
      phase: 'lastRound',
      lastRoundTriggerPlayer: 0,
      currentPlayer: 1,
      players: [fullyEquippedPlayer(16), fullyEquippedPlayer(18)],
    });
    const after = applyMove(s, { type: 'pass' });
    expect(after.winner).toBe(1);
  });

  it('breaks point ties using the Avengers Assemble tile bonus', () => {
    const s = state({
      phase: 'lastRound',
      lastRoundTriggerPlayer: 0,
      currentPlayer: 1,
      players: [fullyEquippedPlayer(16), fullyEquippedPlayer(16)],
      avengersAssembleTile: 1, // worth +3 to player 1
    });
    const after = applyMove(s, { type: 'pass' });
    expect(after.winner).toBe(1);
  });

  it('falls back to highest base points when nobody meets the full win condition', () => {
    const s = state({
      phase: 'lastRound',
      lastRoundTriggerPlayer: 0,
      currentPlayer: 1,
      players: [player({ points: 5 }), player({ points: 12 })],
    });
    const after = applyMove(s, { type: 'pass' });
    expect(after.winner).toBe(1);
  });
});
