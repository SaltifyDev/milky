import * as _t from '@saltify/milky-types';
import z from 'zod';
import { ir } from '@saltify/milky-protocol';

const t = _t as unknown as Record<string, z.ZodType>; // for easier access to types by string keys

const preserveFullCapitalizedWords = ['csrf'];

function snakeCaseToPascalCase(snakeCase: string): string {
  return snakeCase
    .split('_')
    .map((part) => (preserveFullCapitalizedWords.includes(part) ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('');
}

function registerEntries() {
  // clean existing ID entries to prevent errors
  z.globalRegistry._idmap.clear();

  ir.commonStructs.forEach((struct) => {
    const schema = t[struct.name];
    z.globalRegistry.add(schema, {
      id: struct.name,
      title: schema.description,
      description: schema.description,
    });

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
      if (spec.requestFields !== null) {
        const requestId = `${snakeCaseToPascalCase(spec.endpoint)}Input`;
        const inputSchema = t[requestId];
        z.globalRegistry.add(inputSchema, {
          id: requestId,
          title: `${spec.endpoint} 请求参数`,
          description: `${spec.description} API 请求参数`,
        });
      }
      if (spec.responseFields !== null) {
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

// Do initial registration.
// This breaks global state; fortunately, this module is internal.
registerEntries();
