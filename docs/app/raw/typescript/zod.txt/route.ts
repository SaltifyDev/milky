import { ir } from '@saltify/milky-protocol';
import { generateTypeScriptZodSpec } from '@saltify/milky-common';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateTypeScriptZodSpec(ir));
}
