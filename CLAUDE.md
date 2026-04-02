# Splendor — Claude Context

## What this is
A browser-based implementation of Splendor (Marvel edition) with progressively smarter AI opponents.
Primary goal: learn board game AI techniques by building them — random → greedy → MCTS.

## Tech stack
- **Frontend**: Vite + React + TypeScript
- **Hosting**: GitHub Pages (jaetill.github.io/splendor)
- **AI**: Runs entirely in the browser — no backend

## Source structure
```
src/
  game/           — pure game engine, zero UI dependencies
    types.ts      — all types: Card, Noble, Gem, Player, GameState, Move
    constants.ts  — full card deck data, noble tiles
    engine.ts     — rules: move validation, state transitions, win detection
    moves.ts      — move generation: all legal moves from a given state
  ai/             — AI strategies, all implement the same interface
    types.ts      — AIStrategy interface: (state, playerIndex) => Move
    random.ts     — picks a random legal move (baseline)
    greedy.ts     — heuristic: score-maximizing one move ahead
    mcts.ts       — Monte Carlo Tree Search
  components/     — React UI
  hooks/          — custom React hooks
  App.tsx
  main.tsx
```

## Architecture rule
`src/game/` and `src/ai/` must never import from React or any UI library.
They are pure TypeScript — this keeps AI logic testable and portable.

## AI learning progression
1. **Random** — establish baseline, verify move generation is correct
2. **Greedy** — score-maximizing heuristic, teaches evaluation functions
3. **MCTS** — Monte Carlo Tree Search, the standard for modern board game AI

## Splendor rules summary (Marvel edition uses same mechanics)
- 2-4 players, race to 15 prestige points
- Gems: 7 colors (white, blue, green, red, black + 5 gold wildcards)
- Cards: 3 tiers, each has gem cost, prestige points, and a bonus gem color
- Nobles: bonus points awarded automatically when card bonuses meet requirements
- On your turn, exactly one action:
  1. Take 3 different gems (from available colors with 4+ tokens)
  2. Take 2 of the same gem (only if 4+ of that color available)
  3. Reserve a card (take 1 gold, hold card in hand, max 3 reserved)
  4. Purchase a card (from table or your reserved cards)
- Win condition: 15+ prestige points at end of a round (all players finish the round)

## Deployment
- GitHub repo: jaetill/splendor
- GitHub Pages: auto-deploys on push to main via Actions
- Enable Pages in repo Settings → Pages → Source: GitHub Actions
