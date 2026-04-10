import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/cli.ts',
  format: 'esm',
  clean: true,
  target: false,
  deps: {
    onlyBundle: false,
  },
});
