import { ir } from '@saltify/milky-protocol';
import { generateTypeScriptStaticSpec } from '@saltify/milky-common';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateTypeScriptStaticSpec(ir));
}
