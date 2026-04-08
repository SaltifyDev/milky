import { generateMarkdownRoadmap } from '@saltify/milky-common/src/generator/markdown/roadmap';
import { ir } from '@saltify/milky-protocol';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateMarkdownRoadmap(ir));
}
