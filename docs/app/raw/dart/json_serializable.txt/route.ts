import { generateDartJsonSerializableSpec } from '@saltify/milky-common/src/generator/dart/json_serializable';
import { ir } from '@saltify/milky-protocol';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateDartJsonSerializableSpec(ir));
}
