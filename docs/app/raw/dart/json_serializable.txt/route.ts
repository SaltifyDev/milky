import { generateDartJsonSerializableSpec } from '@saltify/milky-common/src/generator/dart/json_serializable';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateDartJsonSerializableSpec());
}
