import { z, ZodType, ZodVoid } from 'zod';
import * as types from '@saltify/milky-types';
import * as apis from '@saltify/milky-types/api';

export const commonStructs = Object.fromEntries(apis.commonStructs.map((i) => [i, types[i]])) as Record<
  string,
  ZodType
>;

export interface Api {
  endpoint: string;
  description: string;
  inputStruct: ZodType;
  outputStruct: ZodType;
}

export interface ApiCategory {
  name: string;
  apis: Api[];
}

export const apiCategories = Object.fromEntries(
  Object.entries(apis.apiCategories).map(([categoryName, categoryInfo]) => [
    categoryName,
    {
      name: categoryInfo.name,
      apis: categoryInfo.apis.map((api) => ({
        endpoint: api.endpoint,
        description: api.description,
        inputStruct: api.inputStruct ? types[api.inputStruct] : z.object({}),
        outputStruct: api.outputStruct ? types[api.outputStruct] : z.void(),
      })),
    },
  ])
) as Record<string, ApiCategory>;

Object.entries(commonStructs).forEach(([name, schema]) => {
  z.globalRegistry.add(schema, { id: name, description: schema.description });
});

Object.entries(apiCategories).forEach(([, category]) => {
  category.apis.forEach((api) => {
    z.globalRegistry.add(api.inputStruct, { id: `Api_${api.endpoint}_input` });
    if (!(api.outputStruct instanceof ZodVoid)) {
      z.globalRegistry.add(api.outputStruct, { id: `Api_${api.endpoint}_output` });
    }
  });
});

export * from '@saltify/milky-types/api';
export const jsonSchemas = {
  milkyVersion: types.milkyVersion,
  packageVersion: types.milkyPackageVersion,
  schemas: z.toJSONSchema(z.globalRegistry, {
    metadata: z.globalRegistry,
  }).schemas,
};
