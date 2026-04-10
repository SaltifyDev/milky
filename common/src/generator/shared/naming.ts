const preserveFullCapitalizedWords = new Set(['csrf']);

export function snakeCaseToLowerCamelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

export function snakeCaseToUpperCamelCase(value: string): string {
  const lowerCamelCase = snakeCaseToLowerCamelCase(value);
  return lowerCamelCase.charAt(0).toUpperCase() + lowerCamelCase.slice(1);
}

export function snakeCaseToPascalCase(value: string): string {
  return value
    .split('_')
    .map((part) =>
      preserveFullCapitalizedWords.has(part) ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join('');
}

export function normalizeDerivedStructName(structName: string, tagValue: string): string {
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
