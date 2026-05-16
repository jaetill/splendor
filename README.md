# Splendor

Browser-based implementation of Splendor (Marvel edition) with progressively smarter AI opponents. Built as a learning vehicle for board-game AI techniques — random → greedy → MCTS.

## Stack

- **Frontend:** Vite + React + TypeScript (no backend)
- **Hosting:** GitHub Pages at https://jaetill.github.io/splendor
- **AI:** All logic runs in-browser

## Architecture rule

`src/game/` and `src/ai/` must never import from React or any UI library. Keeps AI logic testable and portable. UI integration lives in `src/components/` and `src/hooks/`.

## Development

```sh
npm install --legacy-peer-deps   # Vite 8 + Tailwind 4 peer-range workaround if Tailwind ever lands
npm run dev                       # http://localhost:5173
npm run build                     # tsc -b && vite build
npm run lint                      # eslint .
```

## Deploy

GitHub Pages, auto-deployed on push to `main` via `.github/workflows/deploy.yml`. The Pages source must be set to GitHub Actions in repo Settings.

## Platform inheritance

Subscribes to the [Agentic Dev Environment](https://github.com/jaetill/agentic-dev-environment) platform per [ADR-0001](docs/adr/0001-platform-adoption.md). The platform ships the `ai-team` plugin (agents, commands, hooks, skills); this project carries only the marketplace subscription, the permissions block, and its own deviations.