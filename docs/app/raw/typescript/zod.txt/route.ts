import { generateTypeScriptZodSpec } from '@saltify/milky-common/src/generator/typescript/zod';
import { ir } from '@saltify/milky-protocol';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateTypeScriptZodSpec(ir));
}
