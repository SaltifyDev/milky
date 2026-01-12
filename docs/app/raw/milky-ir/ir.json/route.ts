import { generateIR } from '@saltify/milky-common/src/ir';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(generateIR()));
}
