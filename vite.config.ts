import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/hooks/**', 'src/lib/**', 'src/pages/**', 'src/components/**'],
      exclude: ['src/test/**'],
    },
  },
  server: {
    watch: {
      // Poll the filesystem instead of relying on OS FSEvents/inotify,
      // so file writes from any process (including sandboxed tools) trigger HMR.
      usePolling: true,
      interval: 300,
    },
  },
  build: {
    // Inline all assets regardless of size
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
  },
})
