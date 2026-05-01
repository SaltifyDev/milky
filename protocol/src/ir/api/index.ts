import type { IR } from '../../types';
import { fileApiCategory } from './file';
import { friendApiCategory } from './friend';
import { groupApiCategory } from './group';
import { messageApiCategory } from './message';
import { systemApiCategory } from './system';

export const apiCategories: IR['apiCategories'] = [
  systemApiCategory,
  messageApiCategory,
  friendApiCategory,
  groupApiCategory,
  fileApiCategory,
];
