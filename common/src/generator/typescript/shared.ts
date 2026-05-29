import type { IRField } from '@saltify/milky-protocol';

export function getTypeScriptTypeProjection(field: IRField): string {
  if (field.fieldType === 'scalar') {
    if (field.scalarType === 'string') {
      if (field.isArray) {
        return 'string[]';
      } else {
        return 'string';
      }
    }

    if (field.scalarType === 'bool') {
      if (field.isArray) {
        return 'boolean[]';
      } else {
        return 'boolean';
      }
    }

    if (field.isArray) {
      return 'number[]';
    } else {
      return 'number';
    }
  }

  if (field.fieldType === 'enum') {
    if (field.isArray) {
      return `(${field.values.map((value) => `'${value}'`).join(' | ')})[]`;
    } else {
      return field.values.map((value) => `'${value}'`).join(' | ');
    }
  }

  if (field.fieldType === 'ref') {
    if (field.isArray) {
      return `${field.refStructName}[]`;
    } else {
      return field.refStructName;
    }
  }

  throw new Error('Invalid field type');
}
