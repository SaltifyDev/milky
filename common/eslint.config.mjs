import globals from 'globals';
import pluginJs from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import { resolve, dirname } from 'node:path';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  prettierConfig,
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        tsconfigRootDir: resolve(dirname(import.meta.url.replace('file://', ''))),
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      indent: ['error', 2],
    },
  },
  {
    ignores: ['node_modules', '**/lib', '**/out', '**/dist'],
  },
];
