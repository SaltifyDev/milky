import {} from '../../../common';
import { milkyPackageVersion, milkyVersion } from '@saltify/milky-types';
import z from 'zod';

export const dynamic = 'force-static';

export function GET() {
  return new Response(
    JSON.stringify({
      milkyVersion: milkyVersion,
      packageVersion: milkyPackageVersion,
      schemas: z.toJSONSchema(z.globalRegistry, {
        metadata: z.globalRegistry,
        io: 'input',
      }).schemas,
    })
  );
}
