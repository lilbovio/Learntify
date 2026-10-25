import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// Exercise the built Worker/WASM asset URLs, not only Vite's development loader.
export default defineConfig({
  ...base,
  testMatch: 'code.spec.ts',
  outputDir: './test-results/production',
  webServer: [
    {
      command: 'pnpm dev:server',
      url: 'http://127.0.0.1:8787/api/v1/health',
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command:
        'pnpm --filter @learntify/client build && pnpm --filter @learntify/client exec vite preview --host 127.0.0.1 --port 5173 --strictPort',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
});
