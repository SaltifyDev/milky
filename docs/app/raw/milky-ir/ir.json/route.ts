import { ir } from "@saltify/milky-protocol";

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(ir));
}
