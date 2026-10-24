import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['{apps,services,modules,packages,adapters}/**/*.test.ts'],
    // Each D1 suite starts workerd. Avoid competing cold starts on contributor machines.
    // Concurrency within persistence tests remains explicit and unchanged.
    fileParallelism: false,
    testTimeout: 20000,
  },
});
