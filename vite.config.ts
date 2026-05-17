import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/splendor/',
  build: {
    // Emit source maps so Sentry can deobfuscate. deploy.yml uploads them and
    // strips from dist/ before publishing to GitHub Pages.
    sourcemap: true,
  },
})