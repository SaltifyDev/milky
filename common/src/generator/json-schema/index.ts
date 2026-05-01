import type { IR } from '@saltify/milky-protocol';
import { z } from 'zod';

import { initializeZodRegistry, loadGeneratedZodTypesModule, type ZodTypesModule } from '../shared/zod-runtime';

export async function generateJsonSchema(ir: IR, typesModule?: ZodTypesModule) {
  initializeZodRegistry(ir, typesModule ?? (await loadGeneratedZodTypesModule(ir)));

  return {
    milkyVersion: ir.milkyVersion,
    packageVersion: ir.milkyPackageVersion,
    schemas: z.toJSONSchema(z.globalRegistry, {
      metadata: z.globalRegistry,
      io: 'input',
    }).schemas,
  };
}
