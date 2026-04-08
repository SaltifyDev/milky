import { IRField } from "@saltify/milky-protocol";

const preserveFullCapitalizedWords = ['csrf'];

export function snakeCaseToPascalCase(snakeCase: string): string {
  return snakeCase
    .split('_')
    .map((part) =>
      preserveFullCapitalizedWords.includes(part) ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join('');
}

export function normalizeDerivedStructName(structName: string, tagValue: string): string {
  // for example: GroupNotification + kick = GroupKickNotification
  const tagValuePascalCase = snakeCaseToPascalCase(tagValue);
  const lastCapitalIndex = structName
    .split('')
    .reverse()
    .findIndex((char) => char >= 'A' && char <= 'Z');
  if (lastCapitalIndex === -1) {
    return structName + tagValuePascalCase;
  }
  const insertPosition = structName.length - lastCapitalIndex - 1;
  return structName.slice(0, insertPosition) + tagValuePascalCase + structName.slice(insertPosition);
}

export function getTypeScriptTypeProjection(field: IRField): string {
  if (field.fieldType === 'scalar') {
    if (field.scalarType === 'string') {
      return 'string';
    } else if (field.scalarType === 'bool') {
      return 'boolean';
    } else {
      // is number
      return 'number';
    }
  } else if (field.fieldType === 'enum') {
    return field.values.map((v) => `'${v}'`).join(' | ');
  } else {
    // is ref type
    return field.refStructName;
  }
}
