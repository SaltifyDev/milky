import { generateKotlinxSerializationSpec } from '@saltify/milky-common/src/generator/kotlin/kotlinx-serialization';
import { ir } from '@saltify/milky-protocol';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateKotlinxSerializationSpec(ir));
}
