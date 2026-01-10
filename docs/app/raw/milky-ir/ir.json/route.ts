import {} from '@/app/common';
import { generateIR } from '@/app/ir';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(generateIR()));
}
