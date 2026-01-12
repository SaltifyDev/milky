import * as schemaOf from '@saltify/milky-types';
import { commonStructNames, apiSpecCategories, MilkyStructName } from '@saltify/milky-types/namings';
import z from 'zod';

const commonStructMap = new Map<MilkyStructName, z.ZodType>(
  commonStructNames.map((symbol) => [symbol, schemaOf[symbol] as z.ZodType])
);

const commonStructNameMap = new Map<z.ZodType, MilkyStructName>(
  commonStructNames.map((symbol) => [schemaOf[symbol] as z.ZodType, symbol])
);

function registerEntries() {
  // clean existing ID entries to prevent errors
  z.globalRegistry._idmap.clear();

  commonStructMap.forEach((schema, name) => {
    z.globalRegistry.add(schema, {
      id: name,
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

  apiSpecCategories.forEach((category) => {
    category.apiSpecs.forEach((spec) => {
      if (spec.inputStructName !== null) {
        const inputSchema = schemaOf[spec.inputStructName] as z.ZodType;
        z.globalRegistry.add(inputSchema, {
          id: `Api_${spec.endpoint}_input`,
          title: `${spec.endpoint} 请求参数`,
          description: `${spec.description} API 请求参数`,
        });
      }
      if (spec.outputStructName !== null) {
        const outputSchema = schemaOf[spec.outputStructName] as z.ZodType;
        z.globalRegistry.add(outputSchema, {
          id: `Api_${spec.endpoint}_output`,
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

export { commonStructMap, commonStructNameMap, registerEntries };
