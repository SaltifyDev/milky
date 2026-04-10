import { ir } from '@saltify/milky-protocol';
import { generateDartJsonSerializableSpec } from '@saltify/milky-common';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateDartJsonSerializableSpec(ir));
}
