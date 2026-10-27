import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['{apps,services,modules,packages,adapters}/**/*.test.ts'],
    // Each D1 suite starts workerd. Avoid competing cold starts on contributor machines.
    // Concurrency within persistence tests remains explicit and unchanged.
    fileParallelism: false,
    // Cold workerd/D1 startup can exceed Vitest's 10s hook default on contributor machines.
    hookTimeout: 30000,
    testTimeout: 20000,
  },
});
