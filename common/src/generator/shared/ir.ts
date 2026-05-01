import type { IR, IRField, IRPlainUnionStruct } from '@saltify/milky-protocol';

import { snakeCaseToPascalCase } from './naming';

export function getApiTypeNames(endpoint: string) {
  const pascalEndpoint = snakeCaseToPascalCase(endpoint);

  return {
    pascalEndpoint,
    inputName: `${pascalEndpoint}Input`,
    outputName: `${pascalEndpoint}Output`,
  };
}

export function isSameField(first: IRField, second: IRField): boolean {
  if (first.name !== second.name) return false;
  if (first.fieldType !== second.fieldType) return false;
  if (first.isArray !== second.isArray) return false;
  if (first.isOptional !== second.isOptional) return false;

  if (first.fieldType === 'scalar' && second.fieldType === 'scalar') {
    return first.scalarType === second.scalarType;
  }

  if (first.fieldType === 'ref' && second.fieldType === 'ref') {
    return first.refStructName === second.refStructName;
  }

  if (first.fieldType === 'enum' && second.fieldType === 'enum') {
    return first.values.join('\0') === second.values.join('\0');
  }

  return true;
}

export function collectUnionStructNames(ir: IR): Set<string> {
  return new Set(ir.commonStructs.filter((struct) => struct.structType === 'union').map((struct) => struct.name));
}

function visitAllFieldCollections(ir: IR, visit: (fields: IRField[]) => void) {
  ir.commonStructs.forEach((struct) => {
    if (struct.structType === 'simple') {
      visit(struct.fields);
      return;
    }

    if (struct.unionType === 'withData') {
      visit(struct.baseFields);
      struct.derivedTypes.forEach((derivedType) => {
        if (derivedType.derivingType === 'struct') {
          visit(derivedType.fields);
        }
      });
      return;
    }

    struct.derivedStructs.forEach((derivedStruct) => {
      visit(derivedStruct.fields);
    });
  });

  ir.apiCategories.forEach((category) => {
    category.apis.forEach((api) => {
      if (api.requestFields) {
        visit(api.requestFields);
      }

      if (api.responseFields) {
        visit(api.responseFields);
      }
    });
  });
}

export function collectArrayUnionRefs(
  ir: IR,
  unionStructNames: Set<string> = collectUnionStructNames(ir),
): Set<string> {
  const arrayUnionRefs = new Set<string>();

  visitAllFieldCollections(ir, (fields) => {
    fields.forEach((field) => {
      if (field.fieldType === 'ref' && field.isArray && unionStructNames.has(field.refStructName)) {
        arrayUnionRefs.add(field.refStructName);
      }
    });
  });

  return arrayUnionRefs;
}

export function getPlainUnionCommonFields(struct: IRPlainUnionStruct): IRField[] {
  if (struct.derivedStructs.length === 0) {
    return [];
  }

  let commonFields = [...struct.derivedStructs[0].fields];

  for (let index = 1; index < struct.derivedStructs.length; index++) {
    commonFields = commonFields.filter((field) =>
      struct.derivedStructs[index].fields.some((candidate) => isSameField(field, candidate)),
    );
  }

  return commonFields;
}
