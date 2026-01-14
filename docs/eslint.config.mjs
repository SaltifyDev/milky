import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import globals from 'globals';
import { resolve, dirname } from 'node:path';

const eslintConfig = [
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        tsconfigRootDir: resolve(dirname(import.meta.url.replace('file://', ''))),
      },
    },
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ['node_modules', '**/.next', '**/lib', '**/out', '**/dist'],
  },
];

export default eslintConfig;
