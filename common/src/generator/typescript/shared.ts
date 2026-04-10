import { IRField } from '@saltify/milky-protocol';

export function getTypeScriptTypeProjection(field: IRField): string {
  if (field.fieldType === 'scalar') {
    if (field.scalarType === 'string') {
      return 'string';
    }

    if (field.scalarType === 'bool') {
      return 'boolean';
    }

    return 'number';
  }

  if (field.fieldType === 'enum') {
    return field.values.map((value) => `'${value}'`).join(' | ');
  }

  return field.refStructName;
}
