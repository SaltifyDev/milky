import { generateKotlinxSerializationSpec } from '@saltify/milky-common/src/generator/kotlin/kotlinx-serialization';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateKotlinxSerializationSpec());
}
