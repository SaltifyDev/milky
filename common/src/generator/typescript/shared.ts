import type { IRField } from '@saltify/milky-protocol';

export type TypeScriptTypeProjectionMode = 'input' | 'output';

export interface TypeScriptTypeProjectionOptions {
  mode?: TypeScriptTypeProjectionMode;
  getRefTypeName?: (name: string, mode: TypeScriptTypeProjectionMode) => string;
}

function getDefaultRefTypeName(name: string, mode: TypeScriptTypeProjectionMode): string {
  if (mode === 'input') {
    return `${name}_ZodInput`;
  }
  return name;
}

export function getTypeScriptTypeProjection(field: IRField, options: TypeScriptTypeProjectionOptions = {}): string {
  const mode = options.mode ?? 'output';
  const getRefTypeName = options.getRefTypeName ?? getDefaultRefTypeName;

  if (field.isOptional) {
    return `${getTypeScriptTypeProjection({ ...field, isOptional: false }, options)} | null | undefined`;
  }

  if (mode === 'input' && field.defaultValue !== undefined) {
    return `${getTypeScriptTypeProjection({ ...field, defaultValue: undefined }, options)} | null | undefined`;
  }

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
      return `${getRefTypeName(field.refStructName, mode)}[]`;
    } else {
      return getRefTypeName(field.refStructName, mode);
    }
  }

  throw new Error('Invalid field type');
}
