import { generateTypeScriptZodSpec } from '@saltify/milky-common/src/generator/typescript/zod';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateTypeScriptZodSpec());
}
