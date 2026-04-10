import { ir } from '@saltify/milky-protocol';
import { generateRustSerdeSpec } from '@saltify/milky-common';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateRustSerdeSpec(ir));
}
