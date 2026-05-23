import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

/**
 * NovaSync electron-vite config.
 *
 * Output structure (electron-vite defaults):
 *   out/main/index.js      — main process
 *   out/preload/index.js   — preload script
 *   out/renderer/          — renderer (single SPA, 2 modes via ?mode=)
 */
export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  },
});
