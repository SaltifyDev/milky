import {} from '../registry';
import * as t from '@saltify/milky-types';
import z from 'zod';

export function generateJsonSchema() {
  return {
    milkyVersion: t.milkyVersion,
    packageVersion: t.milkyPackageVersion,
    schemas: z.toJSONSchema(z.globalRegistry, {
      metadata: z.globalRegistry,
      io: 'input',
    }).schemas,
  };
}
