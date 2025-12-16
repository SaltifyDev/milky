import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        tsconfigRootDir: path.dirname(import.meta.url.replace('file://', '')),
      },
    },
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['node_modules', '**/.next', '**/lib', '**/out', '**/dist'],
  },
];

export default eslintConfig;
