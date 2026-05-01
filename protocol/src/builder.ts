import type {
  IRApi,
  IRApiCategory,
  IREnumField,
  IRField,
  IRMinorVersion,
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
  since?: IRMinorVersion;
};

type ScalarFieldOptions = CommonFieldOptions & {
  dataType?: string;
};

type SinceMetadata = {
  since?: IRMinorVersion;
};

function withSince<T extends object>(target: T, metadata?: SinceMetadata): T & SinceMetadata {
  if (metadata?.since === undefined) {
    return target;
  }

  return {
    ...target,
    since: metadata.since,
  };
}

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
  const field: IRScalarField = withSince({
    fieldType: 'scalar',
    name,
    description,
    ...resolveFieldBooleans(options),
    scalarType,
  }, options);

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
  const field: IREnumField = withSince({
    fieldType: 'enum',
    name,
    description,
    ...resolveFieldBooleans(options),
    values,
  }, options);

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
  const field: IRRefField = withSince({
    fieldType: 'ref',
    name,
    description,
    ...resolveFieldBooleans(options),
    refStructName,
  }, options);

  if (options?.defaultValue !== undefined) {
    field.defaultValue = options.defaultValue;
  }

  return field;
}

export function struct(name: string, description: string, fields: IRField[], metadata?: SinceMetadata): IRSimpleStruct {
  return withSince({
    structType: 'simple',
    name,
    description,
    fields,
  }, metadata);
}

export function plainUnionStructVariant(
  tagValue: string,
  description: string,
  fields: IRField[],
  metadata?: SinceMetadata
): IRPlainUnionStruct['derivedStructs'][number] {
  return withSince({
    tagValue,
    description,
    fields,
  }, metadata);
}

export function plainUnion(
  name: string,
  description: string,
  tagFieldName: string,
  derivedStructs: IRPlainUnionStruct['derivedStructs'],
  metadata?: SinceMetadata
): IRPlainUnionStruct {
  return withSince({
    structType: 'union',
    unionType: 'plain',
    name,
    description,
    tagFieldName,
    derivedStructs,
  }, metadata);
}

export function nestedUnionStructVariant(
  tagValue: string,
  description: string,
  fields: IRField[],
  metadata?: SinceMetadata
): IRNestedUnionDerivedStructType {
  return withSince({
    tagValue,
    description,
    derivingType: 'struct',
    fields,
  }, metadata);
}

export function nestedUnionRefVariant(
  tagValue: string,
  description: string,
  refStructName: string,
  metadata?: SinceMetadata
): IRNestedUnionDerivedRefType {
  return withSince({
    tagValue,
    description,
    derivingType: 'ref',
    refStructName,
  }, metadata);
}

export function nestedUnion(
  name: string,
  description: string,
  tagFieldName: string,
  baseFields: IRField[],
  derivedTypes: IRNestedUnionStruct['derivedTypes'],
  metadata?: SinceMetadata
): IRNestedUnionStruct {
  return withSince({
    structType: 'union',
    unionType: 'withData',
    name,
    description,
    tagFieldName,
    baseFields,
    derivedTypes,
  }, metadata);
}

export function api(
  endpoint: string,
  description: string,
  requestFields?: IRField[],
  responseFields?: IRField[],
  metadata?: SinceMetadata
): IRApi {
  const spec: IRApi = withSince({
    endpoint,
    description,
  }, metadata);

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
