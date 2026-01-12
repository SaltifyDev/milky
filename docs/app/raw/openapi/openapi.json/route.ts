import { generateOpenApiSpec } from '@saltify/milky-common/src/generator/openapi';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(generateOpenApiSpec()));
}
