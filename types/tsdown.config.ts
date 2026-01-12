import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/namings.ts'],
  format: 'esm',
  dts: true,
  sourcemap: true,
  clean: true,
  target: false,
});
