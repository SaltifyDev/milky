import { generateMarkdownRoadmap } from '@saltify/milky-common/src/generator/markdown/roadmap';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateMarkdownRoadmap());
}
