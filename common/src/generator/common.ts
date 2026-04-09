import { IR } from '@saltify/milky-protocol';
import { z } from 'zod';

const preserveFullCapitalizedWords = ['csrf'];

export function snakeCaseToPascalCase(snakeCase: string): string {
  return snakeCase
    .split('_')
    .map((part) =>
      preserveFullCapitalizedWords.includes(part) ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join('');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function importCodeAsModule(code: string): Promise<Record<string, any>> {
  const mod = await import('data:text/javascript,' + encodeURIComponent(code));
  return mod;
}

export function initRegistry(ir: IR, t: Record<string, z.ZodType>) {
  // clean existing ID entries to prevent errors
  z.globalRegistry._idmap.clear();

  ir.commonStructs.forEach((struct) => {
    let schema = t[struct.name];
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
    category.apis.forEach((spec) => {
      if (spec.requestFields !== undefined) {
        const requestId = `${snakeCaseToPascalCase(spec.endpoint)}Input`;
        const inputSchema = t[requestId];
        z.globalRegistry.add(inputSchema, {
          id: requestId,
          title: `${spec.endpoint} 请求参数`,
          description: `${spec.description} API 请求参数`,
        });
      }
      if (spec.responseFields !== undefined) {
        const outputId = `${snakeCaseToPascalCase(spec.endpoint)}Output`;
        const outputSchema = t[outputId];
        z.globalRegistry.add(outputSchema, {
          id: outputId,
          title: `${spec.endpoint} 响应数据`,
          description: `${spec.description} API 响应数据`,
        });
      }
    });
  });
}
