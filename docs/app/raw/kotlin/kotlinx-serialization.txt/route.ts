import { ir } from '@saltify/milky-protocol';
import { generateKotlinxSerializationSpec } from '@saltify/milky-common';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateKotlinxSerializationSpec(ir));
}
