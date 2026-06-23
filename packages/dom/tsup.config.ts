import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/jsx-runtime.ts', 'src/jsx-dev-runtime.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['@speedjs/core'],
});
