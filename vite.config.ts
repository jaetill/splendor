import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served at the apex of splendor.jaetill.com, so assets resolve from '/'.
  base: '/',
  build: {
    // Emit source maps so Sentry can deobfuscate. deploy.yml uploads them and
    // strips from dist/ before publishing.
    sourcemap: true,
    rollupOptions: {
      // Two HTML entries: the game (index.html) and the OAuth redirect target.
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        callback: fileURLToPath(new URL('./callback.html', import.meta.url)),
      },
    },
  },
});
