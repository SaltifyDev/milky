import {} from '../common';
import { milkyPackageVersion, milkyVersion } from '@saltify/milky-types';
import z from 'zod';

export function generateJsonSchema() {
  return {
    milkyVersion: milkyVersion,
    packageVersion: milkyPackageVersion,
    schemas: z.toJSONSchema(z.globalRegistry, {
      metadata: z.globalRegistry,
      io: 'input',
    }).schemas,
  };
}
