import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// `base: './'` keeps the production build portable: it works from a local
// file:// path when the app is wrapped with Electron/Tauri, and from any
// sub-directory when it is hosted statically.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  build: {
    target: 'chrome110',
    cssCodeSplit: false,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1200,
  },
}))
