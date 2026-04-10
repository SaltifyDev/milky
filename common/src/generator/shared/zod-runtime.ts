import { IR } from '@saltify/milky-protocol';
import { z } from 'zod';
import { transform } from 'sucrase';
import { generateTypeScriptZodSpec } from '../typescript/zod';
import { getApiTypeNames } from './ir';

const dynamicImport = new Function('specifier', 'return import(specifier);') as (
  specifier: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<Record<string, any>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function importCodeAsModule(code: string): Promise<Record<string, any>> {
  return await dynamicImport('data:text/javascript,' + encodeURIComponent(code));
}

export async function loadGeneratedZodTypesModule(ir: IR) {
  const tsCode = generateTypeScriptZodSpec(ir);
  const { code } = transform(tsCode, {
    transforms: ['typescript'],
  });
  const codeWithCorrectImport = code.replace("'zod'", `'${import.meta.resolve('zod')}'`);
  return await importCodeAsModule(codeWithCorrectImport);
}

export function initializeZodRegistry(ir: IR, typesModule: Record<string, z.ZodType>) {
  z.globalRegistry._idmap.clear();

  ir.commonStructs.forEach((struct) => {
    let schema = typesModule[struct.name];
    z.globalRegistry.add(schema, {
      id: struct.name,
      title: schema.description,
      description: schema.description,
    });

    if (schema instanceof z.ZodCatch) {
      schema = schema.def.innerType as z.ZodType;
    }

    if (schema instanceof z.ZodDiscriminatedUnion) {
      schema.options.forEach((option) => {
        const optionAsZodObject = option as z.ZodObject;
        z.globalRegistry.add(optionAsZodObject, {
          title: optionAsZodObject.description,
          description: optionAsZodObject.description,
        });
      });
    }
  });

  ir.apiCategories.forEach((category) => {
    category.apis.forEach((api) => {
      const typeNames = getApiTypeNames(api.endpoint);

      if (api.requestFields !== undefined) {
        const inputSchema = typesModule[typeNames.inputName];
        z.globalRegistry.add(inputSchema, {
          id: typeNames.inputName,
          title: `${api.endpoint} 请求参数`,
          description: `${api.description} API 请求参数`,
        });
      }

      if (api.responseFields !== undefined) {
        const outputSchema = typesModule[typeNames.outputName];
        z.globalRegistry.add(outputSchema, {
          id: typeNames.outputName,
          title: `${api.endpoint} 响应数据`,
          description: `${api.description} API 响应数据`,
        });
      }
    });
  });
}

export function sanitizeGeneratedSchema(schema: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { $schema, ...rest } = schema;
  return rest;
}
