import { commonStructMap, commonStructNameMap } from '@common/common';
import {
  IR,
  IRApi,
  IRApiCategory,
  IRField,
  IRNestedUnionDerivedType,
  IRNestedUnionStruct,
  IRPlainUnionStruct,
  IRStruct,
} from './types';
import z from 'zod';
import * as schemaOf from '@saltify/milky-types';
import { milkyVersion, milkyPackageVersion } from '@saltify/milky-types';
import { apiSpecCategories, commonStructNames } from '@saltify/milky-types/namings';
import { $ZodType } from 'zod/v4/core';

function irFieldFor(name: string, type: $ZodType): IRField {
  const field = irFieldForNoDesc(name, type);
  return {
    ...field,
    description: 'description' in type && typeof type.description === 'string' ? type.description : '',
  };
}

function irFieldForNoDesc(name: string, type: $ZodType): IRField {
  if (type instanceof z.ZodArray) {
    const elementField = irFieldForNoDesc(name, type.element);
    return {
      ...elementField,
      isArray: true,
    };
  }
  if (type instanceof z.ZodNumber) {
    const scalarType = type.meta()?.scalarType === 'int64' ? 'int64' : 'int32';
    return {
      fieldType: 'scalar',
      name,
      description: '',
      isArray: false,
      isOptional: false,
      scalarType,
    };
  }
  if (type instanceof z.ZodBoolean) {
    return {
      fieldType: 'scalar',
      name,
      description: '',
      isArray: false,
      isOptional: false,
      scalarType: 'bool',
    };
  }
  if (type instanceof z.ZodString) {
    return {
      fieldType: 'scalar',
      name,
      description: '',
      isArray: false,
      isOptional: false,
      scalarType: 'string',
    };
  }
  if (type instanceof z.ZodEnum) {
    return {
      fieldType: 'enum',
      name,
      description: '',
      isArray: false,
      isOptional: false,
      values: type.options.map((v) => v.toString()),
    };
  }
  if (type instanceof z.ZodNullable) {
    return irFieldForNoDesc(name, type.unwrap()); // unwrap only once, since we only use z.nullish()
  }
  if (type instanceof z.ZodPipe) {
    return irFieldForNoDesc(name, type.def.in);
  }
  if (type instanceof z.ZodOptional) {
    const innerField = irFieldForNoDesc(name, type.unwrap());
    return {
      ...innerField,
      isOptional: true,
    };
  }
  if (type instanceof z.ZodDefault) {
    let unwrapped = type.unwrap();
    if (unwrapped instanceof z.ZodOptional) {
      unwrapped = unwrapped.unwrap();
    }
    if (unwrapped instanceof z.ZodNullable) {
      unwrapped = unwrapped.unwrap();
    }
    const innerField = irFieldForNoDesc(name, unwrapped);
    return {
      ...innerField,
      defaultValue: type.def.defaultValue,
    };
  }
  if (type instanceof z.ZodLazy) {
    return irFieldForNoDesc(name, type.unwrap());
  }
  if (commonStructNameMap.has(type as z.ZodType)) {
    return {
      fieldType: 'ref',
      name,
      description: '',
      isArray: false,
      isOptional: false,
      refStructName: commonStructNameMap.get(type as z.ZodType)!,
    };
  }

  throw new Error(`Unsupported schema type: ${type.constructor.name} for field ${name}`);
}

function irUnionStructFor(name: string, struct: z.ZodDiscriminatedUnion): IRPlainUnionStruct | IRNestedUnionStruct {
  function isArrayEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  }

  function isAllEqual(arrays: string[][]): boolean {
    if (arrays.length === 0) {
      throw new Error('No options in discriminated union');
    }
    const first = arrays[0];
    return arrays.every((arr) => isArrayEqual(arr, first));
  }

  const keysList = struct.options.map((option) => {
    if (option instanceof z.ZodObject) {
      return Object.keys(option.shape);
    } else {
      throw new Error('Expected ZodDiscriminatedUnion to contain ZodObject');
    }
  });

  if (isAllEqual(keysList)) {
    // should contains a 'data' field
    const commonKeys = keysList[0].filter((key) => key !== 'data' && key !== struct.def.discriminator);
    const options = struct.options as z.ZodObject[];
    if (!('data' in options[0].shape)) {
      throw new Error('Expected all options to have a "data" field');
    }

    return {
      structType: 'union',
      unionType: 'withData',
      name,
      description: struct.description ?? '',
      tagFieldName: struct.def.discriminator,
      baseFields: commonKeys.map((key) => irFieldFor(key, options[0].shape[key])),
      derivedTypes: options.map<IRNestedUnionDerivedType>((option) => {
        const dataField = option.shape['data'];
        if (commonStructNameMap.has(dataField)) {
          return {
            tagValue: (option.shape[struct.def.discriminator] as z.ZodLiteral).value as string,
            description: option.description ?? '',
            derivingType: 'ref',
            refStructName: commonStructNameMap.get(dataField)!,
          };
        } else {
          return {
            tagValue: (option.shape[struct.def.discriminator] as z.ZodLiteral).value as string,
            description: option.description ?? '',
            derivingType: 'struct',
            fields: Object.entries(dataField.shape).map(([fieldName, fieldType]) =>
              irFieldFor(fieldName, fieldType as $ZodType)
            ),
          };
        }
      }),
    };
  } else {
    return {
      structType: 'union',
      unionType: 'plain',
      name,
      description: struct.description ?? '',
      tagFieldName: struct.def.discriminator,
      derivedStructs: struct.options.map((option) => {
        if (!(option instanceof z.ZodObject)) {
          throw new Error('Expected option to be a ZodObject');
        }
        return {
          tagValue: (option.shape[struct.def.discriminator] as z.ZodLiteral).value as string,
          description: option.description ?? '',
          fields: Object.entries(option.shape)
            .filter(([key]) => key !== struct.def.discriminator)
            .map(([fieldName, fieldType]) => irFieldFor(fieldName, fieldType)),
        };
      }),
    };
  }
}

export function generateIR(): IR {
  const irStructs: IRStruct[] = Array.from(commonStructMap).map<IRStruct>(([name, schema]) => {
    if (schema instanceof z.ZodObject) {
      return {
        structType: 'simple',
        name,
        description: schema.description ?? '',
        fields: Object.entries(schema.shape).map(([fieldName, fieldType]) => irFieldFor(fieldName, fieldType)),
      };
    }
    if (schema instanceof z.ZodDiscriminatedUnion) {
      return irUnionStructFor(name, schema);
    }
    throw new Error('Unsupported schema type');
  });

  const irApiCategories: IRApiCategory[] = apiSpecCategories.map<IRApiCategory>((category) => {
    return {
      key: category.key,
      name: category.name,
      apis: category.apiSpecs.map<IRApi>((spec) => {
        return {
          endpoint: spec.endpoint,
          description: spec.description,
          requestFields:
            spec.inputStructName !== null
              ? Object.entries((schemaOf[spec.inputStructName] as z.ZodObject).shape).map(([fieldName, fieldType]) =>
                  irFieldFor(fieldName, fieldType)
                )
              : undefined,
          responseFields:
            spec.outputStructName !== null
              ? Object.entries((schemaOf[spec.outputStructName] as z.ZodObject).shape).map(([fieldName, fieldType]) =>
                  irFieldFor(fieldName, fieldType)
                )
              : undefined,
        };
      }),
    };
  });

  return {
    milkyVersion,
    milkyPackageVersion,
    commonStructs: irStructs,
    apiCategories: irApiCategories,
  };
}
