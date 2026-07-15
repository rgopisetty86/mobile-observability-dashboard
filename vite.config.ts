import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
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
