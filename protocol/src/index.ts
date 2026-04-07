import { commonStructs } from './ir/common';
import { apiCategories } from './ir/api';
import { IR } from './types';
import pkg from '../package.json';

export * from './types';

export const ir: IR = {
  milkyVersion: pkg.version.split('.').slice(0, 2).join('.'),
  milkyPackageVersion: pkg.version,
  commonStructs,
  apiCategories,
};
