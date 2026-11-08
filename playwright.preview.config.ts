import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/preview',
  outputDir: './test-results/preview',
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://127.0.0.1:8790', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command:
      'pnpm --filter @learntify/client build && pnpm --filter @learntify/server exec wrangler dev --config preview/wrangler.example.jsonc --local --ip 127.0.0.1 --port 8790',
    url: 'http://127.0.0.1:8790/api/v1/health',
    reuseExistingServer: false,
    timeout: 120000,
  },
});
