import type { Card, Location } from './types';

// Card data sourced from "Playing Marvel Splendor with Base Splendor" community conversion doc.
// Cost columns: orange (Soul), purple (Power), red (Reality), blue (Space), yellow (Mind)
//
// IMPORTANT: Location tile requirements below are APPROXIMATIONS based on the rulebook example
// (3 yellow + 3 blue + 3 red) and classic Splendor noble patterns. Verify against physical tiles.

// ── Tier 1 cards (40 cards, 8 per bonus color) ───────────────────────────────

const BLUE_TIER1: Card[] = [
  {
    id: 'spider-man-2099',
    tier: 1,
    points: 0,
    bonus: 'blue',
    avengersTagCount: 0,
    cost: { orange: 2, purple: 1 },
  },
  {
    id: 'bullseye',
    tier: 1,
    points: 0,
    bonus: 'blue',
    avengersTagCount: 0,
    cost: { orange: 1, purple: 1, red: 2, yellow: 1 },
  },
  {
    id: 'lockjaw',
    tier: 1,
    points: 0,
    bonus: 'blue',
    avengersTagCount: 0,
    cost: { orange: 1, purple: 1, red: 1, yellow: 1 },
  },
  {
    id: 'valkyrie',
    tier: 1,
    points: 0,
    bonus: 'blue',
    avengersTagCount: 1,
    cost: { red: 1, blue: 1, yellow: 3 },
  },
  {
    id: 'moon-knight',
    tier: 1,
    points: 0,
    bonus: 'blue',
    avengersTagCount: 0,
    cost: { orange: 3 },
  },
  {
    id: 'wasp',
    tier: 1,
    points: 0,
    bonus: 'blue',
    avengersTagCount: 1,
    cost: { purple: 1, red: 2, yellow: 2 },
  },
  {
    id: 'elektra',
    tier: 1,
    points: 0,
    bonus: 'blue',
    avengersTagCount: 0,
    cost: { orange: 2, yellow: 2 },
  },
  { id: 'taskmaster', tier: 1, points: 1, bonus: 'blue', avengersTagCount: 0, cost: { red: 4 } },
];

const RED_TIER1: Card[] = [
  { id: 'mysterio', tier: 1, points: 0, bonus: 'red', avengersTagCount: 0, cost: { purple: 3 } },
  {
    id: 'quake',
    tier: 1,
    points: 0,
    bonus: 'red',
    avengersTagCount: 1,
    cost: { orange: 3, purple: 1, red: 1 },
  },
  {
    id: 'electro',
    tier: 1,
    points: 0,
    bonus: 'red',
    avengersTagCount: 0,
    cost: { blue: 2, yellow: 1 },
  },
  {
    id: 'ms-marvel',
    tier: 1,
    points: 0,
    bonus: 'red',
    avengersTagCount: 1,
    cost: { orange: 2, purple: 2, yellow: 1 },
  },
  {
    id: 'wong',
    tier: 1,
    points: 0,
    bonus: 'red',
    avengersTagCount: 0,
    cost: { orange: 1, purple: 2, blue: 1, yellow: 1 },
  },
  {
    id: 'triton',
    tier: 1,
    points: 0,
    bonus: 'red',
    avengersTagCount: 0,
    cost: { orange: 1, purple: 1, blue: 1, yellow: 1 },
  },
  {
    id: 'crystal',
    tier: 1,
    points: 0,
    bonus: 'red',
    avengersTagCount: 0,
    cost: { purple: 2, red: 2 },
  },
  { id: 'sandman', tier: 1, points: 1, bonus: 'red', avengersTagCount: 0, cost: { purple: 4 } },
];

const YELLOW_TIER1: Card[] = [
  {
    id: 'rocket',
    tier: 1,
    points: 0,
    bonus: 'yellow',
    avengersTagCount: 0,
    cost: { purple: 2, blue: 1 },
  },
  {
    id: 'modok',
    tier: 1,
    points: 0,
    bonus: 'yellow',
    avengersTagCount: 0,
    cost: { red: 2, blue: 2 },
  },
  {
    id: 'spider-woman',
    tier: 1,
    points: 0,
    bonus: 'yellow',
    avengersTagCount: 1,
    cost: { purple: 1, blue: 3, yellow: 1 },
  },
  {
    id: 'grandmaster',
    tier: 1,
    points: 0,
    bonus: 'yellow',
    avengersTagCount: 0,
    cost: { orange: 1, purple: 1, red: 1, blue: 1 },
  },
  {
    id: 'prowler',
    tier: 1,
    points: 0,
    bonus: 'yellow',
    avengersTagCount: 0,
    cost: { orange: 2, purple: 1, red: 1, blue: 1 },
  },
  {
    id: 'squirrel-girl',
    tier: 1,
    points: 0,
    bonus: 'yellow',
    avengersTagCount: 1,
    cost: { orange: 2, red: 2, blue: 1 },
  },
  { id: 'baron-zemo', tier: 1, points: 0, bonus: 'yellow', avengersTagCount: 0, cost: { red: 3 } },
  { id: 'vulture', tier: 1, points: 1, bonus: 'yellow', avengersTagCount: 0, cost: { orange: 4 } },
];

const PURPLE_TIER1: Card[] = [
  {
    id: 'american-chavez',
    tier: 1,
    points: 0,
    bonus: 'purple',
    avengersTagCount: 1,
    cost: { orange: 1, blue: 2, yellow: 2 },
  },
  {
    id: 'lizard',
    tier: 1,
    points: 0,
    bonus: 'purple',
    avengersTagCount: 0,
    cost: { orange: 1, red: 2 },
  },
  {
    id: 'rhino',
    tier: 1,
    points: 0,
    bonus: 'purple',
    avengersTagCount: 0,
    cost: { orange: 1, red: 1, blue: 1, yellow: 1 },
  },
  { id: 'kraven', tier: 1, points: 0, bonus: 'purple', avengersTagCount: 0, cost: { blue: 3 } },
  {
    id: 'gorgon',
    tier: 1,
    points: 0,
    bonus: 'purple',
    avengersTagCount: 0,
    cost: { blue: 2, yellow: 2 },
  },
  {
    id: 'abomination',
    tier: 1,
    points: 0,
    bonus: 'purple',
    avengersTagCount: 0,
    cost: { orange: 1, red: 1, blue: 1, yellow: 2 },
  },
  {
    id: 'winter-soldier',
    tier: 1,
    points: 0,
    bonus: 'purple',
    avengersTagCount: 1,
    cost: { orange: 1, purple: 3, blue: 1 },
  },
  { id: 'scorpion', tier: 1, points: 1, bonus: 'purple', avengersTagCount: 0, cost: { yellow: 4 } },
];

const ORANGE_TIER1: Card[] = [
  {
    id: 'spider-girl',
    tier: 1,
    points: 0,
    bonus: 'orange',
    avengersTagCount: 0,
    cost: { red: 1, blue: 1, yellow: 1 },
  },
  {
    id: 'kingpin',
    tier: 1,
    points: 0,
    bonus: 'orange',
    avengersTagCount: 0,
    cost: { red: 1, yellow: 2 },
  },
  {
    id: 'spider-ham',
    tier: 1,
    points: 0,
    bonus: 'orange',
    avengersTagCount: 0,
    cost: { purple: 2, yellow: 2 },
  },
  {
    id: 'kate-bishop',
    tier: 1,
    points: 0,
    bonus: 'orange',
    avengersTagCount: 1,
    cost: { orange: 1, red: 3, yellow: 1 },
  },
  {
    id: 'silver-sable',
    tier: 1,
    points: 0,
    bonus: 'orange',
    avengersTagCount: 0,
    cost: { yellow: 3 },
  },
  {
    id: 'scarlet-spider',
    tier: 1,
    points: 0,
    bonus: 'orange',
    avengersTagCount: 0,
    cost: { purple: 1, red: 1, blue: 2, yellow: 1 },
  },
  {
    id: 'hawkeye',
    tier: 1,
    points: 0,
    bonus: 'orange',
    avengersTagCount: 1,
    cost: { purple: 2, red: 1, blue: 2 },
  },
  { id: 'yondu', tier: 1, points: 1, bonus: 'orange', avengersTagCount: 0, cost: { blue: 4 } },
];

// ── Tier 2 cards (30 cards, 6 per bonus color) ────────────────────────────────

const BLUE_TIER2: Card[] = [
  {
    id: 'war-machine',
    tier: 2,
    points: 1,
    bonus: 'blue',
    avengersTagCount: 1,
    cost: { red: 3, blue: 2, yellow: 2 },
  },
  {
    id: 'quicksilver',
    tier: 2,
    points: 1,
    bonus: 'blue',
    avengersTagCount: 1,
    cost: { orange: 3, blue: 2, yellow: 3 },
  },
  {
    id: 'black-cat',
    tier: 2,
    points: 2,
    bonus: 'blue',
    avengersTagCount: 0,
    cost: { purple: 5, blue: 3 },
  },
  {
    id: 'miles-morales',
    tier: 2,
    points: 2,
    bonus: 'blue',
    avengersTagCount: 0,
    cost: { blue: 5 },
  },
  {
    id: 'ghost-spider',
    tier: 2,
    points: 2,
    bonus: 'blue',
    avengersTagCount: 0,
    cost: { orange: 4, purple: 2, red: 1 },
  },
  { id: 'nebula', tier: 2, points: 3, bonus: 'blue', avengersTagCount: 0, cost: { blue: 6 } },
];

const RED_TIER2: Card[] = [
  {
    id: 'beta-ray-bill',
    tier: 2,
    points: 1,
    bonus: 'red',
    avengersTagCount: 1,
    cost: { orange: 3, red: 2, blue: 3 },
  },
  {
    id: 'scarlet-witch',
    tier: 2,
    points: 1,
    bonus: 'red',
    avengersTagCount: 1,
    cost: { orange: 3, purple: 2, red: 2 },
  },
  {
    id: 'ghost-rider',
    tier: 2,
    points: 2,
    bonus: 'red',
    avengersTagCount: 0,
    cost: { purple: 1, blue: 4, yellow: 2 },
  },
  {
    id: 'medusa',
    tier: 2,
    points: 2,
    bonus: 'red',
    avengersTagCount: 0,
    cost: { orange: 5, purple: 3 },
  },
  { id: 'venom', tier: 2, points: 2, bonus: 'red', avengersTagCount: 0, cost: { orange: 5 } },
  { id: 'hela', tier: 2, points: 3, bonus: 'red', avengersTagCount: 0, cost: { red: 6 } },
];

const YELLOW_TIER2: Card[] = [
  {
    id: 'shuri',
    tier: 2,
    points: 1,
    bonus: 'yellow',
    avengersTagCount: 1,
    cost: { purple: 3, red: 3, yellow: 2 },
  },
  {
    id: 'maria-hill',
    tier: 2,
    points: 1,
    bonus: 'yellow',
    avengersTagCount: 1,
    cost: { orange: 2, purple: 2, blue: 3 },
  },
  {
    id: 'maximus',
    tier: 2,
    points: 2,
    bonus: 'yellow',
    avengersTagCount: 0,
    cost: { orange: 1, purple: 4, blue: 2 },
  },
  {
    id: 'collector',
    tier: 2,
    points: 2,
    bonus: 'yellow',
    avengersTagCount: 0,
    cost: { yellow: 5 },
  },
  {
    id: 'karnak',
    tier: 2,
    points: 2,
    bonus: 'yellow',
    avengersTagCount: 0,
    cost: { blue: 5, yellow: 3 },
  },
  {
    id: 'red-skull',
    tier: 2,
    points: 3,
    bonus: 'yellow',
    avengersTagCount: 0,
    cost: { yellow: 6 },
  },
];

const PURPLE_TIER2: Card[] = [
  {
    id: 'she-hulk',
    tier: 2,
    points: 1,
    bonus: 'purple',
    avengersTagCount: 1,
    cost: { orange: 2, red: 2, yellow: 3 },
  },
  {
    id: 'okoye',
    tier: 2,
    points: 1,
    bonus: 'purple',
    avengersTagCount: 1,
    cost: { purple: 2, red: 3, blue: 3 },
  },
  {
    id: 'crossbones',
    tier: 2,
    points: 2,
    bonus: 'purple',
    avengersTagCount: 0,
    cost: { orange: 2, red: 4, yellow: 1 },
  },
  { id: 'ronan', tier: 2, points: 2, bonus: 'purple', avengersTagCount: 0, cost: { red: 5 } },
  {
    id: 'carnage',
    tier: 2,
    points: 2,
    bonus: 'purple',
    avengersTagCount: 0,
    cost: { orange: 3, red: 5 },
  },
  {
    id: 'jessica-jones',
    tier: 2,
    points: 3,
    bonus: 'purple',
    avengersTagCount: 0,
    cost: { purple: 6 },
  },
];

const ORANGE_TIER2: Card[] = [
  {
    id: 'nick-fury',
    tier: 2,
    points: 1,
    bonus: 'orange',
    avengersTagCount: 1,
    cost: { purple: 3, blue: 2, yellow: 2 },
  },
  {
    id: 'falcon',
    tier: 2,
    points: 1,
    bonus: 'orange',
    avengersTagCount: 1,
    cost: { orange: 2, purple: 3, yellow: 3 },
  },
  {
    id: 'star-lord',
    tier: 2,
    points: 2,
    bonus: 'orange',
    avengersTagCount: 0,
    cost: { red: 2, blue: 1, yellow: 4 },
  },
  { id: 'punisher', tier: 2, points: 2, bonus: 'orange', avengersTagCount: 0, cost: { orange: 5 } },
  {
    id: 'groot',
    tier: 2,
    points: 2,
    bonus: 'orange',
    avengersTagCount: 0,
    cost: { red: 3, yellow: 5 },
  },
  {
    id: 'daredevil',
    tier: 2,
    points: 3,
    bonus: 'orange',
    avengersTagCount: 0,
    cost: { orange: 6 },
  },
];

// ── Tier 3 cards (20 cards, 4 per bonus color) ────────────────────────────────
// All tier-3 cards have the Time Stone icon (grants green token on first recruit).

const BLUE_TIER3: Card[] = [
  {
    id: 'black-widow',
    tier: 3,
    points: 3,
    bonus: 'blue',
    avengersTagCount: 2,
    cost: { orange: 5, purple: 3, red: 3, yellow: 3 },
  },
  { id: 'iron-fist', tier: 3, points: 4, bonus: 'blue', avengersTagCount: 0, cost: { purple: 7 } },
  {
    id: 'ant-man',
    tier: 3,
    points: 4,
    bonus: 'blue',
    avengersTagCount: 1,
    cost: { orange: 3, purple: 6, blue: 3 },
  },
  {
    id: 'gamora',
    tier: 3,
    points: 5,
    bonus: 'blue',
    avengersTagCount: 0,
    cost: { purple: 7, blue: 3 },
  },
];

const RED_TIER3: Card[] = [
  {
    id: 'thor',
    tier: 3,
    points: 3,
    bonus: 'red',
    avengersTagCount: 2,
    cost: { orange: 3, purple: 3, blue: 5, yellow: 3 },
  },
  // Note: community doc suspects Doctor Strange and Nova art was swapped in production.
  // Using corrected assumption: Nova (not Strange) has the Avengers "A".
  {
    id: 'doctor-strange',
    tier: 3,
    points: 4,
    bonus: 'red',
    avengersTagCount: 0,
    cost: { yellow: 7 },
  },
  {
    id: 'nova',
    tier: 3,
    points: 4,
    bonus: 'red',
    avengersTagCount: 1,
    cost: { red: 3, blue: 3, yellow: 6 },
  },
  {
    id: 'loki',
    tier: 3,
    points: 5,
    bonus: 'red',
    avengersTagCount: 0,
    cost: { red: 3, yellow: 7 },
  },
];

const YELLOW_TIER3: Card[] = [
  {
    id: 'iron-man',
    tier: 3,
    points: 3,
    bonus: 'yellow',
    avengersTagCount: 2,
    cost: { orange: 3, purple: 5, red: 3, blue: 3 },
  },
  {
    id: 'vision',
    tier: 3,
    points: 4,
    bonus: 'yellow',
    avengersTagCount: 1,
    cost: { purple: 3, blue: 6, yellow: 3 },
  },
  {
    id: 'doctor-octopus',
    tier: 3,
    points: 4,
    bonus: 'yellow',
    avengersTagCount: 0,
    cost: { blue: 7 },
  },
  {
    id: 'green-goblin',
    tier: 3,
    points: 5,
    bonus: 'yellow',
    avengersTagCount: 0,
    cost: { blue: 7, yellow: 3 },
  },
];

const PURPLE_TIER3: Card[] = [
  {
    id: 'hulk',
    tier: 3,
    points: 3,
    bonus: 'purple',
    avengersTagCount: 2,
    cost: { purple: 5, red: 3, blue: 3, yellow: 3 },
  },
  { id: 'drax', tier: 3, points: 4, bonus: 'purple', avengersTagCount: 0, cost: { orange: 7 } },
  {
    id: 'captain-marvel',
    tier: 3,
    points: 4,
    bonus: 'purple',
    avengersTagCount: 1,
    cost: { orange: 6, purple: 3, red: 3 },
  },
  {
    id: 'luke-cage',
    tier: 3,
    points: 5,
    bonus: 'purple',
    avengersTagCount: 0,
    cost: { orange: 7, purple: 3 },
  },
];

const ORANGE_TIER3: Card[] = [
  {
    id: 'captain-america',
    tier: 3,
    points: 3,
    bonus: 'orange',
    avengersTagCount: 2,
    cost: { purple: 3, red: 3, blue: 3, yellow: 5 },
  },
  { id: 'black-bolt', tier: 3, points: 4, bonus: 'orange', avengersTagCount: 0, cost: { red: 7 } },
  {
    id: 'black-panther',
    tier: 3,
    points: 4,
    bonus: 'orange',
    avengersTagCount: 1,
    cost: { orange: 3, red: 6, yellow: 3 },
  },
  {
    id: 'spider-man',
    tier: 3,
    points: 5,
    bonus: 'orange',
    avengersTagCount: 0,
    cost: { orange: 3, red: 7 },
  },
];

// ── Exports ───────────────────────────────────────────────────────────────────

export const TIER1_CARDS: Card[] = [
  ...BLUE_TIER1,
  ...RED_TIER1,
  ...YELLOW_TIER1,
  ...PURPLE_TIER1,
  ...ORANGE_TIER1,
];

export const TIER2_CARDS: Card[] = [
  ...BLUE_TIER2,
  ...RED_TIER2,
  ...YELLOW_TIER2,
  ...PURPLE_TIER2,
  ...ORANGE_TIER2,
];

export const TIER3_CARDS: Card[] = [
  ...BLUE_TIER3,
  ...RED_TIER3,
  ...YELLOW_TIER3,
  ...PURPLE_TIER3,
  ...ORANGE_TIER3,
];

export const ALL_CARDS: Card[] = [...TIER1_CARDS, ...TIER2_CARDS, ...TIER3_CARDS];

// ── Location tiles ────────────────────────────────────────────────────────────
// 4 double-sided tiles = 8 possible locations. createGame selects N = numPlayers.
//
// ⚠ APPROXIMATE — requirements below are estimated from the rulebook example
// (one tile requires 3 yellow + 3 blue + 3 red) and classic Splendor noble patterns.
// Verify these values against the physical tiles before shipping.

export const ALL_LOCATIONS: Location[] = [
  { id: 'loc-1', points: 3, requires: { orange: 4, purple: 4 } },
  { id: 'loc-2', points: 3, requires: { red: 4, blue: 4 } },
  { id: 'loc-3', points: 3, requires: { yellow: 4, blue: 4 } },
  { id: 'loc-4', points: 3, requires: { orange: 4, yellow: 4 } },
  { id: 'loc-5', points: 3, requires: { orange: 3, purple: 3, red: 3 } },
  { id: 'loc-6', points: 3, requires: { yellow: 3, blue: 3, red: 3 } }, // matches rulebook example
  { id: 'loc-7', points: 3, requires: { orange: 3, blue: 3, yellow: 3 } },
  { id: 'loc-8', points: 3, requires: { purple: 3, red: 3, yellow: 3 } },
];
