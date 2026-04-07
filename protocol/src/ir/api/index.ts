import { systemApiCategory } from './system';
import { messageApiCategory } from './message';
import { friendApiCategory } from './friend';
import { groupApiCategory } from './group';
import { fileApiCategory } from './file';
import type { IR } from '../../types';

export const apiCategories: IR['apiCategories'] = [
  systemApiCategory,
  messageApiCategory,
  friendApiCategory,
  groupApiCategory,
  fileApiCategory,
];
