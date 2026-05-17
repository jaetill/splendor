import type {
  Card,
  GameState,
  GemColor,
  GemSupply,
  Location,
  Move,
  Player,
  RegularGem,
} from './types';
import { REGULAR_GEMS } from './types';
import { ALL_LOCATIONS, TIER1_CARDS, TIER2_CARDS, TIER3_CARDS } from './constants';

// ── Helpers ──────────────────────────────────────────────────────────────────

function cloneGems(gems: GemSupply): GemSupply {
  return { ...gems };
}

function emptyGems(): GemSupply {
  return { orange: 0, purple: 0, red: 0, blue: 0, yellow: 0, gray: 0, green: 0 };
}

function totalGems(gems: GemSupply): number {
  return Object.values(gems).reduce((a, b) => a + b, 0);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clonePlayer(p: Player): Player {
  return {
    gems: cloneGems(p.gems),
    bonuses: { ...p.bonuses },
    recruited: [...p.recruited],
    reserved: [...p.reserved],
    locations: [...p.locations],
    points: p.points,
    avengersTagCount: p.avengersTagCount,
    hasGreenToken: p.hasGreenToken,
  };
}

function cloneState(state: GameState): GameState {
  return {
    players: state.players.map(clonePlayer),
    currentPlayer: state.currentPlayer,
    gems: cloneGems(state.gems),
    decks: {
      tier1: [...state.decks.tier1],
      tier2: [...state.decks.tier2],
      tier3: [...state.decks.tier3],
    },
    board: {
      tier1: [...state.board.tier1],
      tier2: [...state.board.tier2],
      tier3: [...state.board.tier3],
    },
    locations: [...state.locations],
    avengersAssembleTile: state.avengersAssembleTile,
    phase: state.phase,
    lastRoundTriggerPlayer: state.lastRoundTriggerPlayer,
    winner: state.winner,
  };
}

function createPlayer(): Player {
  return {
    gems: emptyGems(),
    bonuses: { orange: 0, purple: 0, red: 0, blue: 0, yellow: 0 },
    recruited: [],
    reserved: [],
    locations: [],
    points: 0,
    avengersTagCount: 0,
    hasGreenToken: false,
  };
}

/** Gem bank counts. Gray (S.H.I.E.L.D.) is always 5. Green (Time Stone) varies by player count. */
function initialBank(numPlayers: number): GemSupply {
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

/**
 * Compute minimum payment to recruit a card: spend regular gems first, use gray as wildcard.
 * Returns null if the player cannot afford the card.
 */
function computePayment(
  card: Card,
  playerGems: GemSupply,
  playerBonuses: Record<RegularGem, number>,
): Partial<Record<GemColor, number>> | null {
  const payment: Partial<Record<GemColor, number>> = {};
  let grayNeeded = 0;

  for (const color of REGULAR_GEMS) {
    const required = card.cost[color] ?? 0;
    const bonus = playerBonuses[color] ?? 0;
    const owed = Math.max(0, required - bonus);
    if (owed === 0) continue;

    const available = playerGems[color] ?? 0;
    const paid = Math.min(owed, available);
    if (paid > 0) payment[color] = paid;
    grayNeeded += owed - paid;
  }

  if (grayNeeded > (playerGems.gray ?? 0)) return null;
  if (grayNeeded > 0) payment.gray = grayNeeded;
  return payment;
}

/**
 * Check if a player qualifies for any locations at end of turn.
 * Only one location can be taken per turn; if multiple qualify, player chooses.
 * For the engine we award the first qualifying one (lowest index).
 */
function checkLocations(
  locations: Location[],
  player: Player,
): {
  locations: Location[];
  player: Player;
} {
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const qualifies = (Object.entries(loc.requires) as [RegularGem, number][]).every(
      ([color, req]) => (player.bonuses[color] ?? 0) >= req,
    );
    if (qualifies) {
      const updatedPlayer: Player = {
        ...player,
        locations: [...player.locations, loc],
        points: player.points + loc.points,
      };
      const updatedLocations = locations.filter((_, idx) => idx !== i);
      return { locations: updatedLocations, player: updatedPlayer };
    }
  }
  return { locations, player };
}

/**
 * Update Avengers Assemble tile ownership after a player's tag count changes.
 * First player to reach 3+ tags claims it. Current owner keeps it on a tie.
 */
function updateAvengersAssemble(
  state: GameState,
  playerIndex: number,
): { avengersAssembleTile: number | null } {
  const player = state.players[playerIndex];
  const currentOwner = state.avengersAssembleTile;

  if (player.avengersTagCount < 3) return { avengersAssembleTile: currentOwner };

  if (currentOwner === null) {
    return { avengersAssembleTile: playerIndex };
  }

  const ownerCount = state.players[currentOwner].avengersTagCount;
  if (player.avengersTagCount > ownerCount) {
    return { avengersAssembleTile: playerIndex };
  }

  return { avengersAssembleTile: currentOwner };
}

/**
 * Effective points for a player (includes Avengers Assemble tile bonus if held).
 */
function effectivePoints(state: GameState, playerIndex: number): number {
  const base = state.players[playerIndex].points;
  return base + (state.avengersAssembleTile === playerIndex ? 3 : 0);
}

/**
 * Check whether a player meets all Infinity Gauntlet win conditions:
 * 16+ effective points AND 1 bonus of each regular color AND 1 green token.
 */
function meetsWinCondition(state: GameState, playerIndex: number): boolean {
  const player = state.players[playerIndex];
  if (effectivePoints(state, playerIndex) < 16) return false;
  if (!player.hasGreenToken) return false;
  if (REGULAR_GEMS.some((c) => (player.bonuses[c] ?? 0) < 1)) return false;
  return true;
}

/**
 * Determine the winner among all players who meet the win condition.
 * Tiebreak order: most points → holds Avengers tile → fewest cards recruited.
 */
function determineWinner(state: GameState): number {
  const eligible = state.players.map((_, i) => i).filter((i) => meetsWinCondition(state, i));

  if (eligible.length === 0) {
    // Fallback: just highest points (shouldn't happen in a well-ended game)
    return state.players
      .map((_, i) => i)
      .reduce((best, i) => (effectivePoints(state, i) > effectivePoints(state, best) ? i : best));
  }

  return eligible.reduce((best, i) => {
    const ep = effectivePoints(state, i);
    const bestEp = effectivePoints(state, best);
    if (ep > bestEp) return i;
    if (ep < bestEp) return best;
    // Tie: Avengers tile holder wins
    if (state.avengersAssembleTile === i) return i;
    if (state.avengersAssembleTile === best) return best;
    // Still tied: fewest cards
    return state.players[i].recruited.length < state.players[best].recruited.length ? i : best;
  });
}

// ── createGame ───────────────────────────────────────────────────────────────

export function createGame(numPlayers: number): GameState {
  if (numPlayers < 2 || numPlayers > 4) throw new Error('numPlayers must be 2–4');

  const tier1 = shuffle(TIER1_CARDS);
  const tier2 = shuffle(TIER2_CARDS);
  const tier3 = shuffle(TIER3_CARDS);

  const board1 = tier1.splice(0, 4);
  const board2 = tier2.splice(0, 4);
  const board3 = tier3.splice(0, 4);

  const locations = shuffle(ALL_LOCATIONS).slice(0, numPlayers);

  return {
    players: Array.from({ length: numPlayers }, createPlayer),
    currentPlayer: 0,
    gems: initialBank(numPlayers),
    decks: { tier1, tier2, tier3 },
    board: { tier1: board1, tier2: board2, tier3: board3 },
    locations,
    avengersAssembleTile: null,
    phase: 'playing',
    lastRoundTriggerPlayer: null,
    winner: null,
  };
}

// ── isLegalMove ──────────────────────────────────────────────────────────────

export function isLegalMove(state: GameState, move: Move): boolean {
  if (state.phase === 'ended') return false;

  const player = state.players[state.currentPlayer];
  const bank = state.gems;

  switch (move.type) {
    case 'take3': {
      const { gems } = move;
      if (gems.length < 1 || gems.length > 3) return false;
      if (new Set(gems).size !== gems.length) return false; // must be distinct
      if (!gems.every((g) => bank[g] >= 1)) return false;
      // Can only take fewer than 3 if fewer than 3 regular colors are available
      const availableColors = REGULAR_GEMS.filter((g) => bank[g] >= 1);
      if (gems.length < Math.min(3, availableColors.length)) return false;
      // 10-gem limit (green tokens can't be returned so we hard-cap here)
      const nonGreen = totalGems(player.gems) - (player.hasGreenToken ? 1 : 0);
      if (nonGreen + gems.length > 10) return false;
      return true;
    }

    case 'take2': {
      if (bank[move.gem] < 4) return false;
      const nonGreen = totalGems(player.gems) - (player.hasGreenToken ? 1 : 0);
      if (nonGreen + 2 > 10) return false;
      return true;
    }

    case 'reserveBoard': {
      if (player.reserved.length >= 3) return false;
      const tier = `tier${move.card.tier}` as 'tier1' | 'tier2' | 'tier3';
      return state.board[tier].some((c) => c.id === move.card.id);
    }

    case 'reserveDeck': {
      if (player.reserved.length >= 3) return false;
      const tier = `tier${move.tier}` as 'tier1' | 'tier2' | 'tier3';
      return state.decks[tier].length > 0;
    }

    case 'recruit': {
      const { card } = move;
      const tier = `tier${card.tier}` as 'tier1' | 'tier2' | 'tier3';
      const onBoard = state.board[tier].some((c) => c.id === card.id);
      const inReserved = player.reserved.some((c) => c.id === card.id);
      if (!onBoard && !inReserved) return false;
      return computePayment(card, player.gems, player.bonuses) !== null;
    }

    case 'pass':
      return true;

    default:
      return false;
  }
}

// ── applyMove ────────────────────────────────────────────────────────────────

export function applyMove(state: GameState, move: Move): GameState {
  if (!isLegalMove(state, move)) {
    throw new Error(`Illegal move: ${JSON.stringify(move)}`);
  }

  const next = cloneState(state);
  const idx = next.currentPlayer;
  const player = next.players[idx];

  switch (move.type) {
    case 'take3': {
      for (const gem of move.gems) {
        player.gems[gem]++;
        next.gems[gem]--;
      }
      break;
    }

    case 'take2': {
      player.gems[move.gem] += 2;
      next.gems[move.gem] -= 2;
      break;
    }

    case 'reserveBoard': {
      const tier = `tier${move.card.tier}` as 'tier1' | 'tier2' | 'tier3';
      next.board[tier] = next.board[tier].filter((c) => c.id !== move.card.id);
      // Refill from deck
      while (next.board[tier].length < 4 && next.decks[tier].length > 0) {
        next.board[tier].push(next.decks[tier].shift()!);
      }
      player.reserved.push(move.card);
      if (next.gems.gray > 0) {
        player.gems.gray++;
        next.gems.gray--;
      }
      break;
    }

    case 'reserveDeck': {
      const tier = `tier${move.tier}` as 'tier1' | 'tier2' | 'tier3';
      const card = next.decks[tier].shift()!;
      player.reserved.push(card);
      if (next.gems.gray > 0) {
        player.gems.gray++;
        next.gems.gray--;
      }
      break;
    }

    case 'recruit': {
      const { card } = move;
      const tier = `tier${card.tier}` as 'tier1' | 'tier2' | 'tier3';

      // Remove from board or reserved
      if (next.board[tier].some((c) => c.id === card.id)) {
        next.board[tier] = next.board[tier].filter((c) => c.id !== card.id);
        while (next.board[tier].length < 4 && next.decks[tier].length > 0) {
          next.board[tier].push(next.decks[tier].shift()!);
        }
      } else {
        player.reserved = player.reserved.filter((c) => c.id !== card.id);
      }

      // Apply payment
      const payment = computePayment(card, player.gems, player.bonuses)!;
      for (const color of Object.keys(payment) as GemColor[]) {
        const amount = payment[color] ?? 0;
        player.gems[color] -= amount;
        next.gems[color] += amount;
      }

      // Update player state
      player.recruited.push(card);
      player.bonuses[card.bonus]++;
      player.points += card.points;
      player.avengersTagCount += card.avengersTagCount;

      // Time Stone: first tier-3 card grants a green token
      if (card.tier === 3 && !player.hasGreenToken && next.gems.green > 0) {
        player.hasGreenToken = true;
        next.gems.green--;
      }

      // Avengers Assemble tile
      const avengersResult = updateAvengersAssemble(next, idx);
      next.avengersAssembleTile = avengersResult.avengersAssembleTile;

      // Location check (max 1 per turn)
      const locResult = checkLocations(next.locations, player);
      next.locations = locResult.locations;
      next.players[idx] = locResult.player;

      break;
    }

    case 'pass':
      break;
  }

  // ── End-of-turn phase transitions ─────────────────────────────────────────

  if (next.phase === 'playing' && meetsWinCondition(next, idx)) {
    next.phase = 'lastRound';
    next.lastRoundTriggerPlayer = idx;
  }

  const nextPlayerIndex = (idx + 1) % next.players.length;

  if (next.phase === 'lastRound' && nextPlayerIndex === next.lastRoundTriggerPlayer) {
    next.phase = 'ended';
    next.winner = determineWinner(next);
  }

  if (next.phase !== 'ended') {
    next.currentPlayer = nextPlayerIndex;
  }

  return next;
}
