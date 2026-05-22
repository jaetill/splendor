# Splendor — Claude Context

## What this is

A browser-based implementation of Splendor (Marvel edition) with progressively smarter AI opponents.
Primary goal: learn board game AI techniques by building them — random → greedy → MCTS.

## Tech stack

- **Frontend**: Vite + React + TypeScript
- **Hosting**: S3 + CloudFront at **https://splendor.jaetill.com** (OIDC deploy on push to `main`)
- **Auth**: Cognito Hosted UI (Authorization Code + PKCE), hand-rolled in `src/auth/` — gates on **authentication only** (any pool user; no group required, unlike the sibling apps)
- **AI**: Runs entirely in the browser — no backend, no game data persisted

## AWS resources

| Resource           | ID / value                                         | Region    | Notes                                                                             |
| ------------------ | -------------------------------------------------- | --------- | --------------------------------------------------------------------------------- |
| S3 bucket          | `jaetill-splendor`                                 | us-east-2 | Public access blocked; CloudFront OAC only                                        |
| CloudFront         | `E15CORI71INNUD` (`d3k83v0212smxz.cloudfront.net`) | global    | Alias `splendor.jaetill.com`; SPA fallback 403/404→`/index.html`                  |
| CloudFront OAC     | `E2QLHBKB31O58U` (`jaetill-splendor-oac`)          | global    | Locks bucket reads to this distribution                                           |
| ACM cert           | `*.jaetill.com` (`...e0222a7e...`)                 | us-east-1 | Shared wildcard — covers the subdomain                                            |
| OIDC deploy role   | `splendor-github-deploy`                           | —         | Trust `repo:jaetill/splendor:ref:refs/heads/main`; S3 + `CreateInvalidation` only |
| Cognito pool       | `us-east-2_xneeJzaDJ`                              | us-east-2 | **Shared** with the other apps                                                    |
| Cognito App Client | `4o3dja4seo8or2q3i33v9hc02s` (`splendor-web`)      | us-east-2 | Public PKCE client; no group gate                                                 |
| Cognito branding   | `7a6f6b2d-513f-422d-8a62-3d81bb2a97a8`             | us-east-2 | Required for Hosted UI to render                                                  |
| Route 53           | A/AAAA alias `splendor.jaetill.com` → CloudFront   | global    | Alias zone `Z2FDTNDATAQYW2`                                                       |

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

## Auth

- Two HTML entries: `index.html` (game) and `callback.html` (OAuth redirect target).
- `src/auth/config.ts` — Cognito client config (non-secret); prod origin is hardcoded `https://splendor.jaetill.com`, dev uses `window.location.origin`.
- `src/auth/auth.ts` — PKCE flow (`sp.*` localStorage keys), ported from the sibling apps.
- `src/main.tsx` — entry gate: if `!isAuthenticated()`, redirect to Hosted UI; else render the game. **Authentication only — no `cognito:groups` check.**
- SSO: a signed-in portal user reaches splendor with no second prompt (shared Hosted UI session at `just.jaetill.com`). A direct visitor without a session gets the login page.
- Local dev runs at `localhost:5173` or `5300` (both registered as callback URLs). `127.0.0.1` is **not** registered — use `localhost`.

## Deployment

- GitHub repo: jaetill/splendor; `deploy.yml` runs on push to `main`.
- Build → upload source maps to Sentry → strip maps from `dist/` → assume `splendor-github-deploy` via OIDC → `s3 sync` (hashed assets `immutable`, HTML `no-cache`, **no `--delete`**) → CloudFront invalidation on `/index.html` + `/callback.html`.
- Distribution id `E15CORI71INNUD` is hardcoded in the workflow (non-secret). Only `AWS_ROLE_ARN` is a GitHub secret.

---

## Platform inheritance

This project adopts the [Agentic Dev Environment](https://github.com/jaetill/agentic-dev-environment) platform per [ADR-0001](docs/adr/0001-platform-adoption.md). The platform's 11 standards (in [`docs/standards/`](https://github.com/jaetill/agentic-dev-environment/tree/main/docs/standards) of the workspace repo) define how this project is operated. TypeScript-specific deviations are documented in ADR-0001.

### AI configuration

The platform's subagents, slash commands, and hooks are delivered via the `ai-team` plugin subscription (per workspace ADR-0015). `.claude/settings.json` retains only the plugin subscription (`enabledPlugins`), the permissions block, and `extraKnownMarketplaces` pointing at the workspace's GitHub source. Hook scripts, agent definitions, and commands are NOT committed locally — they ship via the plugin.

### Finding lifecycle (per workspace ADR-0016)

Reviewer agents calibrate severity (don't over-escalate), low/nit findings get `deferred-until-adjacent` label and bundle into the next adjacent PR, Sentry-bug + critical issues auto-trigger the implementer. See workspace ADR-0016 for the full policy.
