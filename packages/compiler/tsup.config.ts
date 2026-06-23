import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['@speedjs/router', '@babel/core', '@babel/preset-typescript', '@babel/plugin-transform-react-jsx'],
});
