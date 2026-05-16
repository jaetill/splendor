/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

// Vitest configuration per platform ADR-0004.
// Splendor has no tests yet; scaffolding is in place so Phase 4 CI passes
// (vitest run --passWithNoTests) and future tests have a tiered-coverage home.

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.{test,spec}.{ts,tsx,mts}', 'src/**/*.{test,spec}.{ts,tsx,mts}'],
    exclude: ['node_modules/**', '.claude/worktrees/**', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      include: ['src/game/**/*.ts', 'src/ai/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/main.tsx',
        'src/App.tsx',
        'src/components/**',
        'src/hooks/**',
      ],
      // Thresholds intentionally omitted until tests exist. Per ADR-0004
      // tier definitions: src/game/ + src/ai/ should aim for 80/70 once
      // tests land. UI layer (components/hooks) is utility tier (60/50).
    },
  },
});
