import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/api-endpoints.ts'],
  format: 'esm',
  dts: true,
  sourcemap: true,
  clean: true,
  target: false,
});
