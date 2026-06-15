## Dependency Watch (2026-06-15)

### Manifest: `package.json` (root)

#### Security Audit (production dependencies only)

No vulnerabilities found across 10 production dependencies (531 total including dev/optional/peer).

#### Outdated Check

`npm outdated` surfaced three entries, but in each case `wanted == latest` — the semver range in `package.json` already resolves to the latest published version. No version bumps are available beyond what is already declared.

| Package | Declared range | Latest | Classification |
|---|---|---|---|
| `react` | `^19.2.4` | 19.2.7 | Within range — no action |
| `react-dom` | `^19.2.4` | 19.2.7 | Within range — no action |
| `@sentry/browser` | `^10.53.1` | 10.58.0 | Within range — no action |

All three are minor/patch bumps fully covered by the `^` range already pinned; a clean `npm install` will pull the latest satisfying versions automatically.

---

No actionable findings.
