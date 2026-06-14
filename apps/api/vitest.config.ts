import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
  },
  resolve: {
    alias: {
      // Resolve the workspace package from source so tests don't need a build
      '@the-prophet/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
});
