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
    types.ts      — all types: Card, Location, Gem, Player, GameState, Move
    constants.ts  — full card deck data + location tiles (costs/reqs approximate, see file header)
    engine.ts     — rules: move validation, state transitions, win detection
    moves.ts      — move generation: all legal moves from a given state
  ai/             — AI strategies, all implement the AIStrategy interface
    types.ts      — AIStrategy { name; selectMove(state, playerIndex) }; RNG type
    random.ts     — picks a uniformly random legal move (baseline); injectable RNG
    greedy.ts     — heuristic: score-maximizing one move ahead (planned)
    mcts.ts       — Monte Carlo Tree Search (planned)
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

## Game rules (Marvel edition — the engine is canonical)

This is a custom Marvel-themed variant, **not** base Splendor. Where they differ, the engine wins. (Card costs and location requirements are still unverified against the physical set — see the `constants.ts` header.)

**Tokens — Infinity Stones + a wildcard**

- 5 regular stones pay card costs: orange (Soul), purple (Power), red (Reality), blue (Space), yellow (Mind)
- green = Time Stone: special. Earned by recruiting your first tier-3 card; exempt from the 10-token hold limit; required to win
- gray = S.H.I.E.L.D. wildcard (the "gold" equivalent): substitutes for any stone when recruiting
- Bank seeding by player count: regular = 4 / 5 / 7 (2 / 3 / 4 players); gray always 5; green = 2 / 3 / 4
- A player may hold at most 10 tokens — the green Time Stone does not count toward the cap

**Cards** — 3 tiers; each has a gem cost, prestige points, one bonus stone color (a permanent discount), and an Avengers tag count (0–2). All tier-3 cards carry the Time Stone.

**Locations** (replace Nobles) — worth 3 points, auto-claimed (max 1 per turn) when your card bonuses meet the requirement.

**Avengers Assemble tile** — held by the player with the most Avengers tags once they reach 3+; worth +3 effective points. A tie keeps the current holder; it transfers only when a challenger strictly exceeds the holder.

**Turn — exactly one action:**

1. Take 3 different regular stones (take fewer only if fewer than 3 colors have any tokens)
2. Take 2 of the same regular stone (only if the bank holds 4+ of it)
3. Reserve a card (from the board or the top of a deck; gain 1 gray wildcard if available and under the token cap; max 3 reserved)
4. Recruit (buy) a card from the board or your reserved hand (engine auto-pays: regular stones first, gray as wildcard)

- `pass` is legal only when no other move is available

**Win condition (Infinity Gauntlet):** the endgame triggers when a player reaches **16+ effective points AND holds the green Time Stone AND owns ≥1 bonus of each of the 5 regular stones**. Effective points = card points + location points + 3 if holding the Avengers tile. Play continues until the round completes (every player gets equal turns), then the winner is the eligible player with the most effective points, tie-broken by: holds the Avengers tile → fewest recruited cards.

## Deployment

- GitHub repo: jaetill/splendor
- GitHub Pages: auto-deploys on push to main via Actions
- Enable Pages in repo Settings → Pages → Source: GitHub Actions

---

## Platform inheritance

This project adopts the [Agentic Dev Environment](https://github.com/jaetill/agentic-dev-environment) platform per [ADR-0001](docs/adr/0001-platform-adoption.md). The platform's 11 standards (in [`docs/standards/`](https://github.com/jaetill/agentic-dev-environment/tree/main/docs/standards) of the workspace repo) define how this project is operated. TypeScript-specific deviations are documented in ADR-0001.

### AI configuration

The platform's subagents, slash commands, and hooks are delivered via the `ai-team` plugin subscription (per workspace ADR-0015). `.claude/settings.json` retains only the plugin subscription (`enabledPlugins`), the permissions block, and `extraKnownMarketplaces` pointing at the workspace's GitHub source. Hook scripts, agent definitions, and commands are NOT committed locally — they ship via the plugin.

### Finding lifecycle (per workspace ADR-0016)

Reviewer agents calibrate severity (don't over-escalate), low/nit findings get `deferred-until-adjacent` label and bundle into the next adjacent PR, Sentry-bug + critical issues auto-trigger the implementer. See workspace ADR-0016 for the full policy.
