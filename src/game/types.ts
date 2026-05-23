// ── Gem / token colors ────────────────────────────────────────────────────────
// Five regular Infinity Stone colors + Gray (S.H.I.E.L.D. wildcard) + Green (Time Stone)

export type RegularGem = 'orange' | 'purple' | 'red' | 'blue' | 'yellow';
export type GemColor = RegularGem | 'gray' | 'green';

export const REGULAR_GEMS: RegularGem[] = ['orange', 'purple', 'red', 'blue', 'yellow'];

export type GemSupply = Record<GemColor, number>;

// ── Card ──────────────────────────────────────────────────────────────────────

export interface Card {
  id: string;
  tier: 1 | 2 | 3;
  points: number;
  bonus: RegularGem; // permanent token discount this card provides
  cost: Partial<Record<RegularGem, number>>;
  avengersTagCount: 0 | 1 | 2; // 0 on most cards
  // All tier-3 cards carry the Time Stone icon (grants 1 green token on first recruit)
}

// ── Location tile (replaces Nobles) ──────────────────────────────────────────

export interface Location {
  id: string;
  points: 3; // always 3 in this game
  requires: Partial<Record<RegularGem, number>>;
}

// ── Player ────────────────────────────────────────────────────────────────────

export interface Player {
  gems: GemSupply;
  bonuses: Record<RegularGem, number>; // permanent discounts from recruited cards
  recruited: Card[];
  reserved: Card[]; // max 3
  locations: Location[];
  points: number; // card pts + location pts (Avengers tile tracked separately)
  avengersTagCount: number;
  hasGreenToken: boolean; // Time Stone — earned by recruiting first tier-3 card
}

// ── Game state ────────────────────────────────────────────────────────────────

export interface GameState {
  players: Player[];
  currentPlayer: number;
  gems: GemSupply; // bank
  decks: { tier1: Card[]; tier2: Card[]; tier3: Card[] };
  board: { tier1: Card[]; tier2: Card[]; tier3: Card[] }; // up to 4 face-up per tier
  locations: Location[];
  avengersAssembleTile: number | null; // index of player who currently holds it
  phase: 'playing' | 'lastRound' | 'ended';
  lastRoundTriggerPlayer: number | null;
  winner: number | null;
}

// ── Moves ─────────────────────────────────────────────────────────────────────

export type Move =
  | { type: 'take3'; gems: RegularGem[] } // 1–3 distinct regular colors (no gray, no green)
  | { type: 'take2'; gem: RegularGem } // requires ≥4 of that color in bank
  | { type: 'reserveBoard'; card: Card } // reserve a face-up board card
  | { type: 'reserveDeck'; tier: 1 | 2 | 3 } // reserve top of deck (card unknown to opponents)
  | { type: 'recruit'; card: Card } // engine auto-computes payment (regular gems first, gray as wildcard)
  | { type: 'pass' };
