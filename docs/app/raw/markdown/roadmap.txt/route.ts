import { commonStructs, apiCategories } from '../../../common';
import { ZodDiscriminatedUnion, ZodObject, ZodLiteral } from 'zod';
import { $ZodType } from 'zod/v4/core';
import { milkyVersion, milkyPackageVersion } from '@saltify/milky-types';

export const dynamic = 'force-static';

function generateRoadmap(): string {
  const lines: string[] = [];
  function l(line: string = '') {
    lines.push(line);
  }
  l('# Roadmap');
  l();
  l(`<!-- Generated from Milky ${milkyVersion} (${milkyPackageVersion}) -->`);
  l();
  l('## API');
  l();
  Object.entries(apiCategories).forEach(([, category]) => {
    l(`### ${category.name}`);
    l();
    category.apis.forEach((api) => {
      l(`- [ ] \`/${api.endpoint}\` ${api.description}`);
    });
    l();
  });
  l('## 事件 (Event)');
  l();
  const eventStruct = commonStructs['Event'] as ZodDiscriminatedUnion;
  eventStruct.options.forEach((option) => {
    const optionAsZodObject = option as ZodObject;
    l(
      `- [ ] \`${(optionAsZodObject.shape[eventStruct.def.discriminator] as ZodLiteral).value}\` ${
        optionAsZodObject.description
      }`
    );
  });
  l();
  l('## 消息段 (Segment)');
  l();
  l('### 接收消息段 (IncomingSegment)');
  l();
  const incomingSegmentStruct = commonStructs['IncomingSegment'] as ZodDiscriminatedUnion;
  incomingSegmentStruct.options.forEach((option) => {
    const optionAsZodObject = option as ZodObject;
    l(
      `- [ ] \`${(optionAsZodObject.shape[incomingSegmentStruct.def.discriminator] as ZodLiteral).value}\` ${
        optionAsZodObject.description
      }`
    );
  });
  l();
  l('### 发送消息段 (OutgoingSegment)');
  l();
  const outgoingSegmentStruct = commonStructs['OutgoingSegment'] as ZodDiscriminatedUnion;
  outgoingSegmentStruct.options.forEach((option) => {
    const optionAsZodObject = option as ZodObject;
    l(
      `- [ ] \`${(optionAsZodObject.shape[outgoingSegmentStruct.def.discriminator] as ZodLiteral).value}\` ${
        optionAsZodObject.description
      }`
    );
  });
  return lines.join('\n');
}

export function GET() {
  return new Response(generateRoadmap());
}
