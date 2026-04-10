import { IR } from '@saltify/milky-protocol';
import { z } from 'zod';
import { initializeZodRegistry, loadGeneratedZodTypesModule } from '../shared/zod-runtime';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateJsonSchema(ir: IR, typesModule?: any) {
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
