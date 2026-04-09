import { ir } from '@saltify/milky-protocol';
import { generateOpenApiSpec } from '@saltify/milky-common';

export const dynamic = 'force-static';

export async function GET() {
  return new Response(JSON.stringify(await generateOpenApiSpec(ir, await import('@saltify/milky-types'))));
}
