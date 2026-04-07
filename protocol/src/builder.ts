import {
  IRApi,
  IRApiCategory,
  IREnumField,
  IRField,
  IRNestedUnionDerivedRefType,
  IRNestedUnionDerivedStructType,
  IRNestedUnionStruct,
  IRPlainUnionStruct,
  IRRefField,
  IRScalarField,
  IRSimpleStruct,
} from './types';

type CommonFieldOptions = {
  isArray?: boolean;
  isOptional?: boolean;
  defaultValue?: unknown;
};

type ScalarFieldOptions = CommonFieldOptions & {
  dataType?: string;
};

function resolveFieldBooleans(options?: CommonFieldOptions) {
  return {
    isArray: options?.isArray ?? false,
    isOptional: options?.isOptional ?? false,
  };
}

export function scalarField(
  name: string,
  description: string,
  scalarType: IRScalarField['scalarType'],
  options?: ScalarFieldOptions
): IRScalarField {
  const field: IRScalarField = {
    fieldType: 'scalar',
    name,
    description,
    ...resolveFieldBooleans(options),
    scalarType,
  };

  if (options?.dataType !== undefined) {
    field.dataType = options.dataType;
  }
  if (options?.defaultValue !== undefined) {
    field.defaultValue = options.defaultValue;
  }

  return field;
}

export function enumField(
  name: string,
  description: string,
  values: string[],
  options?: CommonFieldOptions
): IREnumField {
  const field: IREnumField = {
    fieldType: 'enum',
    name,
    description,
    ...resolveFieldBooleans(options),
    values,
  };

  if (options?.defaultValue !== undefined) {
    field.defaultValue = options.defaultValue;
  }

  return field;
}

export function refField(
  name: string,
  description: string,
  refStructName: string,
  options?: CommonFieldOptions
): IRRefField {
  const field: IRRefField = {
    fieldType: 'ref',
    name,
    description,
    ...resolveFieldBooleans(options),
    refStructName,
  };

  if (options?.defaultValue !== undefined) {
    field.defaultValue = options.defaultValue;
  }

  return field;
}

export function struct(name: string, description: string, fields: IRField[]): IRSimpleStruct {
  return {
    structType: 'simple',
    name,
    description,
    fields,
  };
}

export function plainUnionStructVariant(
  tagValue: string,
  description: string,
  fields: IRField[]
): IRPlainUnionStruct['derivedStructs'][number] {
  return {
    tagValue,
    description,
    fields,
  };
}

export function plainUnion(
  name: string,
  description: string,
  tagFieldName: string,
  derivedStructs: IRPlainUnionStruct['derivedStructs']
): IRPlainUnionStruct {
  return {
    structType: 'union',
    unionType: 'plain',
    name,
    description,
    tagFieldName,
    derivedStructs,
  };
}

export function nestedUnionStructVariant(
  tagValue: string,
  description: string,
  fields: IRField[]
): IRNestedUnionDerivedStructType {
  return {
    tagValue,
    description,
    derivingType: 'struct',
    fields,
  };
}

export function nestedUnionRefVariant(
  tagValue: string,
  description: string,
  refStructName: string
): IRNestedUnionDerivedRefType {
  return {
    tagValue,
    description,
    derivingType: 'ref',
    refStructName,
  };
}

export function nestedUnion(
  name: string,
  description: string,
  tagFieldName: string,
  baseFields: IRField[],
  derivedTypes: IRNestedUnionStruct['derivedTypes']
): IRNestedUnionStruct {
  return {
    structType: 'union',
    unionType: 'withData',
    name,
    description,
    tagFieldName,
    baseFields,
    derivedTypes,
  };
}

export function api(
  endpoint: string,
  description: string,
  requestFields?: IRField[],
  responseFields?: IRField[]
): IRApi {
  const spec: IRApi = {
    endpoint,
    description,
  };

  if (requestFields !== undefined) {
    spec.requestFields = requestFields;
  }
  if (responseFields !== undefined) {
    spec.responseFields = responseFields;
  }

  return spec;
}

export function category(key: string, name: string, apis: IRApi[]): IRApiCategory {
  return {
    key,
    name,
    apis,
  };
}
