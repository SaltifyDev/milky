import { IR } from '@saltify/milky-protocol';
import { z } from 'zod';
import { generateTypeScriptZodSpec } from '../typescript/zod';
import { importCodeAsModule, initRegistry } from '../common';
import { transform } from 'sucrase';

async function initTypesModule(ir: IR) {
  const tsCode = generateTypeScriptZodSpec(ir);
  const { code } = transform(tsCode, {
    transforms: ['typescript'],
  });
  const codeWithCorrectImport = code.replace(
    '\'zod\'',
    `'${import.meta.resolve('zod')}'`
  );
  return await importCodeAsModule(codeWithCorrectImport);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateJsonSchema(ir: IR, typesModule?: any) {
  initRegistry(ir, typesModule ?? (await initTypesModule(ir)));

  return {
    milkyVersion: ir.milkyVersion,
    packageVersion: ir.milkyPackageVersion,
    schemas: z.toJSONSchema(z.globalRegistry, {
      metadata: z.globalRegistry,
      io: 'input',
    }).schemas,
  };
}
