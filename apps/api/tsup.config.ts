import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'es2022',
  clean: true,
  // Bundle the workspace package (its TS source) into the output so Node
  // never tries to import a raw .ts at runtime. Other deps stay external.
  noExternal: ['@the-prophet/shared'],
});
