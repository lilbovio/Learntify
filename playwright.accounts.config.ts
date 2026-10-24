import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/accounts',
  outputDir: './test-results/accounts',
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 45000,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:5174', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm db:local && pnpm dev:accounts:server',
      url: 'http://127.0.0.1:8788/api/v1/health',
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command: 'pnpm dev:accounts:client',
      url: 'http://localhost:5174',
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
});
