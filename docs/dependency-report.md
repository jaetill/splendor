## Dependency Watch (2026-06-29)

---

## `package.json` (root)

### Security Audit — Production (`--omit=dev`)

**No vulnerabilities found in production dependencies.**

The 10 production packages (3 direct + transitive) are clean.

---

### Security Audit — Dev Dependencies

> Dev advisories do not reach the production bundle (static GitHub Pages site), but they affect
> developer machines and CI runners that execute `npm test`, `npm run dev`, and `npm run build`.

#### CRITICAL — Immediate Update Required

| Package | Pinned | Advisory |
|---------|--------|----------|
| `vitest` | 2.1.9 | Arbitrary file read and execution when Vitest UI server is listening |
| `@vitest/coverage-v8` | 2.1.9 | Pulled in via `vitest` — same exposure |
| `happy-dom` | 14.12.3 | VM context escape → RCE via `<script>` tag; mishandled fetch credentials |

**Action:** `npm install --save-dev vitest@latest @vitest/coverage-v8@latest happy-dom@latest`

#### HIGH — Immediate Update Required

| Package | Pinned | Advisory |
|---------|--------|----------|
| `vite` | 8.0.3 | Multiple path-traversal issues in dev server (`.map` endpoint, WebSocket, `server.fs.deny` bypasses on Windows); NTLMv2 hash disclosure via `launch-editor` |

**Action:** `npm install --save-dev vite@latest`

#### MODERATE — Batch in Next Sprint

| Package | Pinned | Advisory |
|---------|--------|----------|
| `esbuild` | 0.27.7 | Dev server allows cross-origin requests to read arbitrary responses; arbitrary file read on Windows |
| `postcss` | 8.5.8 | XSS via unescaped `</style>` in CSS stringify output |
| `js-yaml` | 4.1.1 | Quadratic-complexity DoS via repeated merge-key aliases |
| `brace-expansion` | 1.1.13 | Large numeric range defeats documented `max` DoS protection |
| `vite-node` | 2.1.9 | Pulled in via `vite` — same exposure |

**Action:** `npm install --save-dev esbuild@latest postcss@latest js-yaml@latest` (brace-expansion is typically resolved transitively)

#### LOW — Monthly Sweep

| Package | Pinned | Advisory |
|---------|--------|----------|
| `@babel/core` | 7.29.0 | Arbitrary file read via `sourceMappingURL` comment (requires attacker-controlled CSS/JS input) |

---

### Outdated Packages

> `npm outdated` compares lockfile-pinned versions against the npm registry.
> Production deps are not installed in this environment; pinned versions are from `package-lock.json`.

#### Minor Version Bump — Batch in Monthly Sweep

| Package | Installed (lockfile) | Latest | Notes |
|---------|---------------------|--------|-------|
| `@sentry/browser` | 10.53.1 | 10.62.0 | Minor bump within `^10.53.1` range; no breaking changes expected |

#### Patch Version Bump — Low Priority

| Package | Installed (lockfile) | Latest | Notes |
|---------|---------------------|--------|-------|
| `react` | 19.2.4 | 19.2.7 | Patch; update together with `react-dom` |
| `react-dom` | 19.2.4 | 19.2.7 | Patch; update together with `react` |

---

### Summary

| Severity | Count | Action |
|----------|-------|--------|
| CRITICAL (dev) | 3 | Immediate update — `vitest`, `@vitest/coverage-v8`, `happy-dom` |
| HIGH (dev) | 1 | Immediate update — `vite` |
| MODERATE (dev) | 5 | Next sprint — `esbuild`, `postcss`, `js-yaml`, `brace-expansion`, `vite-node` |
| LOW (dev) | 1 | Monthly sweep — `@babel/core` |
| Minor bump (prod) | 1 | Monthly sweep — `@sentry/browser` |
| Patch bump (prod) | 2 | Low priority — `react`, `react-dom` |
