import { generateRustSerdeSpec } from '@saltify/milky-common/src/generator/rust/serde';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateRustSerdeSpec());
}
