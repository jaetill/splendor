# ADR-0001: Adopt the Agentic Dev Environment platform

- **Status:** Accepted
- **Date:** 2026-05-16
- **Deciders:** Jason Tilley
- **Tags:** platform, governance, AI-workflows, typescript

## Context and Problem Statement

Splendor is the first React + TypeScript project to adopt the [Agentic Dev Environment](https://github.com/jaetill/agentic-dev-environment) platform. Sibling projects (game-night-pwa, meal-planner, ai-teacher, jaetill-portal) are all vanilla JS or Next.js. This ADR records the decision to adopt the platform and the TypeScript-specific deviations from the platform's default (JS-flavored) configurations.

## Decision Drivers

- Consistency with sibling projects that already subscribe to the `ai-team` plugin
- Single source of truth for AI workflows via the plugin (per workspace ADR-0015)
- Splendor's "learning project" character benefits from the same standards (ADRs, CI gates, AI agents) without per-project re-configuration
- TypeScript + React 19 + Vite 8 needs slightly different lint/test/format tooling than the JS sibling projects

## Considered Options

- **Option A:** Adopt the platform fully (Phases 1-4 minimum), with TS-flavored adaptations
- **Option B:** Adopt only the AI configuration (plugin subscription), skip quality gates + CI
- **Option C:** Defer indefinitely

## Decision Outcome

**Option A — phased adoption with TS adaptations.** Apply Phases 1-4 immediately. Defer Phases 5-7 (observability, IaC, user feedback) as separate decisions.

### Phase status

| Phase | Status | Notes |
|---|---|---|
| 1 - Documentation | In this PR | `docs/` tree, mkdocs, ADRs |
| 2 - AI configuration | In this PR | `.claude/settings.json` subscribes to `ai-team` plugin |
| 3 - Quality gates | Follow-up PR | Prettier, husky, lint-staged, commitlint, vitest (existing eslint.config.js stays, augmented) |
| 4 - CI workflows | Follow-up PR | claude-pr-review, security-scan, release-please, finding-lifecycle triggers |
| 5 - Observability | Deferred | Splendor is frontend-only, no server errors; Sentry-frontend deferred until first user-reported bug |
| 6 - IaC retrofit | Not applicable | No AWS infra — just GitHub Pages |
| 7 - User feedback Lambda | Not applicable | Learning project; no user-feedback surface |

## Deviations from platform defaults

### Frontend language: TypeScript (not vanilla JS)

The platform's `typescript-app` template is Next.js + TypeScript. Splendor is **Vite + React + TypeScript** — closer to a hybrid. Implications:
- Keep splendor's existing `eslint.config.js` (already TS-aware via `typescript-eslint`)
- Don't add the platform's JS-flavored ESLint config; layer TS-aware rules on top of what's there
- Use `vitest` for unit tests (matches sibling-project test framework choice)

### No backend

No Lambda, no API Gateway, no shared backend Lambda libs. Skip all `lambda/` patterns. The platform's `install-node-deps` composite action still applies (root deps only; the lambda step is skipped because there's no `lambda/package.json`).

### Deploy: GitHub Pages, not S3+CloudFront or Vercel

Existing `.github/workflows/deploy.yml` deploys to GitHub Pages via `actions/deploy-pages`. Keep it. No additional deploy infrastructure needed.

### IaC: not applicable

No AWS resources. Skip Phase 6. If splendor ever needs server-side hosting, revisit.

### Branch convention: main

Matches platform default. No deviation.

### Tests: none currently

Phase 3 will add vitest scaffolding. Existing engine + AI code is intentionally type-safe but untested — first test PR should target `src/game/engine.ts` and `src/ai/random.ts` since they have clear contracts.

## Consequences

### Positive

- Plugin subagents (architect, code-reviewer, security-reviewer, etc.) available immediately
- Standards inheritance from the workspace
- First TS-flavored consumer of the platform; informs future TS projects' adoption

### Negative

- Each Phase 3-4 PR adds ~10-15 dev dependencies
- `--legacy-peer-deps` may be needed for any future Tailwind/etc. add-ons (Vite 8 peer-range workaround)
- First-time TS adaptation: some platform conventions (e.g. coverage tier thresholds in vitest.config) need TS-specific tuning

### Neutral

- The platform plugin source is `github.com/jaetill/agentic-dev-environment` (public). No auth needed.

## Implementation notes

- **Plugin subscription:** `.claude/settings.json` with `extraKnownMarketplaces.agentic-dev-environment.source = {"source": "github", "repo": "jaetill/agentic-dev-environment"}` and `enabledPlugins["ai-team@agentic-dev-environment"] = true`.
- **Permissions:** canonical deny block from the plugin README.
- **TypeScript handling:** existing `eslint.config.js` is preserved. Phase 3 will add prettier, husky, lint-staged, commitlint, vitest. The platform's `install-node-deps` composite action handles npm install with `--legacy-peer-deps` flag.
- **Finding-lifecycle policy (ADR-0016)** applies: reviewer agents calibrate severity, low/nit findings get `deferred-until-adjacent`, implementer bundles up to 2 adjacent fixes per feature PR.

## Links

- [Workspace ADR-0015 - platform as plugin](https://github.com/jaetill/agentic-dev-environment/blob/main/docs/adr/0015-platform-as-plugin.md)
- [Workspace ADR-0016 - finding lifecycle](https://github.com/jaetill/agentic-dev-environment/blob/main/docs/adr/0016-finding-lifecycle-calibration-deferral.md)
- [Workspace standards](https://github.com/jaetill/agentic-dev-environment/tree/main/docs/standards)
- Sibling project adoptions: game-night-pwa, meal-planner, ai-teacher, jaetill-portal (all adopted 2026-05-16)