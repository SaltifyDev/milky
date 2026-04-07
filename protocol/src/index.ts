import { commonStructs } from './ir/common';
import { apiCategories } from './ir/api';
import { IR } from './types';

export * from './types';

export const ir: IR = {
  milkyVersion: '1.2',
  milkyPackageVersion: '1.2.0',
  commonStructs,
  apiCategories,
};
