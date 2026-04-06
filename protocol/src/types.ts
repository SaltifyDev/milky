export interface IR {
  milkyVersion: string;
  milkyPackageVersion: string;
  commonStructs: IRStruct[];
  apiCategories: IRApiCategory[];
}

// IR for structs

export interface IRStructBase<T extends string> {
  structType: T;
  name: string;
  description: string;
}

export interface IRSimpleStruct extends IRStructBase<'simple'> {
  fields: IRField[];
}

export interface IRUnionStructBase<T extends string> extends IRStructBase<'union'> {
  unionType: T;
  tagFieldName: string;
}

export interface IRPlainUnionStruct extends IRUnionStructBase<'plain'> {
  derivedStructs: {
    tagValue: string;
    description: string;
    fields: IRField[];
  }[];
}

export interface IRNestedUnionStruct extends IRUnionStructBase<'withData'> {
  baseFields: IRField[];
  derivedTypes: IRNestedUnionDerivedType[];
}

export interface IRNestedUnionDerivedTypeBase<T extends string> {
  tagValue: string;
  description: string;
  derivingType: T;
}

export interface IRNestedUnionDerivedStructType extends IRNestedUnionDerivedTypeBase<'struct'> {
  fields: IRField[];
}

export interface IRNestedUnionDerivedRefType extends IRNestedUnionDerivedTypeBase<'ref'> {
  refStructName: string;
}

export type IRNestedUnionDerivedType = IRNestedUnionDerivedStructType | IRNestedUnionDerivedRefType;

export type IRStruct = IRSimpleStruct | IRPlainUnionStruct | IRNestedUnionStruct;

// IR for API

export interface IRApiCategory {
  key: string;
  name: string;
  apis: IRApi[];
}

export interface IRApi {
  endpoint: string;
  description: string;
  requestFields?: IRField[];
  responseFields?: IRField[];
}

// IR for fields

export interface IRFieldBase<T extends string> {
  fieldType: T;
  name: string;
  dataType?: string;
  description: string;
  isArray: boolean;
  isOptional: boolean;
  defaultValue?: unknown;
}

export interface IRScalarField extends IRFieldBase<'scalar'> {
  scalarType: 'int32' | 'int64' | 'string' | 'bool';
}

export interface IREnumField extends IRFieldBase<'enum'> {
  values: string[];
}

export interface IRRefField extends IRFieldBase<'ref'> {
  refStructName: string;
}

export type IRField = IRScalarField | IREnumField | IRRefField;
