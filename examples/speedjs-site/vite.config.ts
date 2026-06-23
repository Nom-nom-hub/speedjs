import { defineConfig } from 'vite';
import { speed } from '@speedjs/vite';

export default defineConfig({
  plugins: [speed()],
});
