import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm'],
  dts: false,
  clean: true,
  sourcemap: true,
  bundle: true,
  splitting: false,
  platform: 'node',
  target: 'node18',
  external: ['vite', 'fs-extra', '@speedjs/bench', '@speedjs/compiler'],
});
