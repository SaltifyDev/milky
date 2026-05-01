import { generateOpenApiSpec } from '@saltify/milky-common';
import { ir } from '@saltify/milky-protocol';

export const dynamic = 'force-static';

export async function GET() {
  return new Response(JSON.stringify(await generateOpenApiSpec(ir, await import('@saltify/milky-types'))));
}
