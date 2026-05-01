import pkg from '../package.json';
import { apiCategories } from './ir/api';
import { commonStructs } from './ir/common';
import type { IR } from './types';

export * from './types';

export const ir: IR = {
  milkyVersion: pkg.version.split('.').slice(0, 2).join('.'),
  milkyPackageVersion: pkg.version,
  commonStructs,
  apiCategories,
};

export default ir;
