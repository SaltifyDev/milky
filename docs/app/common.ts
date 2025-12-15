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

z.globalRegistry._idmap.clear();

Object.entries(commonStructs).forEach(([name, schema]) => {
  z.globalRegistry.add(schema, {
    id: name,
    title: schema.description,
    description: schema.description,
  });

  if (schema instanceof z.ZodDiscriminatedUnion) {
    schema.options.forEach((option) => {
      const optionAsZodObject = option as z.ZodObject<any>;
      z.globalRegistry.add(optionAsZodObject, {
        title: optionAsZodObject.description,
        description: optionAsZodObject.description,
      });
    });
  }
});

Object.entries(apiCategories).forEach(([, category]) => {
  category.apis.forEach((api) => {
    z.globalRegistry.add(api.inputStruct, {
      id: `Api_${api.endpoint}_input`,
      title: `${api.endpoint} 请求参数`,
      description: `${api.description} 请求参数`,
    });
    if (!(api.outputStruct instanceof ZodVoid)) {
      z.globalRegistry.add(api.outputStruct, {
        id: `Api_${api.endpoint}_output`,
        title: `${api.endpoint} 响应数据`,
        description: `${api.description} 响应数据`,
      });
    }
  });
});

export * from '@saltify/milky-types/api';
