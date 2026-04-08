import {} from '@/app/raw/registry';
import * as t from '@saltify/milky-types';
import z from 'zod';

function generateJsonSchema() {
  return {
    milkyVersion: t.milkyVersion,
    packageVersion: t.milkyPackageVersion,
    schemas: z.toJSONSchema(z.globalRegistry, {
      metadata: z.globalRegistry,
      io: 'input',
    }).schemas,
  };
}


export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(generateJsonSchema()));
}
