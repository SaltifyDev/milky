import { apiCategories } from '@saltify/milky-types/api';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ApiCollection = Object.entries(apiCategories)
  .map(([category, data]) => {
    const res = data.apis.map((api) => {
      const input = api.inputStruct ? `input: z.input<typeof types.${api.inputStruct}>` : '';
      const output = api.outputStruct ? `types.${api.outputStruct}` : 'void';
      return `${api.endpoint}: (${input}) => ${output};`;
    });
    return `  // ${category} API\n  ${res.join('\n  ')}\n`;
  })
  .join('\n');

await fs.promises.writeFile(
  path.resolve('src', 'api.g.ts'),
  `
/* eslint-disable */
import * as types from '@saltify/milky-types';
import type z from 'zod';

export type ApiCollection = {
${ApiCollection}
}
`.trim()
);
