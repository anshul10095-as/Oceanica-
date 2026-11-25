import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` -> deployable PWA in dist/ (manifest, service worker, icons, offline page).
// `npm run build:single` -> one self-contained HTML file in dist-single/ for sandboxed previews.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'single' ? [react(), viteSingleFile()] : [react()],
  define: { __SINGLE__: JSON.stringify(mode === 'single') },
  build: {
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    copyPublicDir: mode !== 'single',
    chunkSizeWarningLimit: 1200,
  },
}));
