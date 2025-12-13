import { jsonSchemas } from '../../../common';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(jsonSchemas));
}
