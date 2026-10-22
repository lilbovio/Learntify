import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { include: ['{apps,services,modules,packages,adapters}/**/*.test.ts'], testTimeout: 20000 },
});
