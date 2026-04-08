import { generateRustSerdeSpec } from '@saltify/milky-common/src/generator/rust/serde';
import { ir } from '@saltify/milky-protocol';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateRustSerdeSpec(ir));
}
