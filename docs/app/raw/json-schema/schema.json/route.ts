import { generateJsonSchema } from '@saltify/milky-common/src/generator/json-schema';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(generateJsonSchema()));
}
