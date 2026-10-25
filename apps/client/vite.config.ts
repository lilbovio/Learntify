import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  worker: { format: 'es' },
  server: {
    proxy: {
      '/api':
        mode === 'external'
          ? 'http://127.0.0.1:8789'
          : mode === 'accounts'
            ? 'http://127.0.0.1:8788'
            : 'http://127.0.0.1:8787',
    },
  },
}));
