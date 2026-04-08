import { generateTypeScriptStaticSpec } from '@saltify/milky-common/src/generator/typescript/static';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateTypeScriptStaticSpec());
}
