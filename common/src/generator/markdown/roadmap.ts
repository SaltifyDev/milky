import type { IR, IRNestedUnionStruct, IRPlainUnionStruct } from '@saltify/milky-protocol';

function findUnionStruct(ir: IR, name: string): IRPlainUnionStruct | IRNestedUnionStruct {
  const struct = ir.commonStructs.find((candidate) => candidate.name === name);

  if (!struct || struct.structType !== 'union') {
    throw new Error(`Union struct "${name}" not found in IR`);
  }

  return struct;
}

function getUnionVariants(
  struct: IRPlainUnionStruct | IRNestedUnionStruct,
): { tagValue: string; description: string }[] {
  if (struct.unionType === 'withData') {
    return struct.derivedTypes.map((derivedType) => ({
      tagValue: derivedType.tagValue,
      description: derivedType.description,
    }));
  }

  return struct.derivedStructs.map((derivedStruct) => ({
    tagValue: derivedStruct.tagValue,
    description: derivedStruct.description,
  }));
}

export function generateMarkdownRoadmap(ir: IR): string {
  const lines: string[] = [];
  function l(line: string = '') {
    lines.push(line);
  }
  l('# Roadmap');
  l();
  l(`<!-- Generated from Milky ${ir.milkyVersion} (${ir.milkyPackageVersion}) -->`);
  l();
  l('## API');
  l();
  ir.apiCategories.forEach((category) => {
    l(`### ${category.name}`);
    l();
    category.apis.forEach((api) => {
      l(`- [ ] \`/${api.endpoint}\` ${api.description}`);
    });
    l();
  });
  l('## 事件 (Event)');
  l();
  getUnionVariants(findUnionStruct(ir, 'Event')).forEach((variant) => {
    l(`- [ ] \`${variant.tagValue}\` ${variant.description}`);
  });
  l();
  l('## 消息段 (Segment)');
  l();
  l('### 接收消息段 (IncomingSegment)');
  l();
  getUnionVariants(findUnionStruct(ir, 'IncomingSegment')).forEach((variant) => {
    l(`- [ ] \`${variant.tagValue}\` ${variant.description}`);
  });
  l();
  l('### 发送消息段 (OutgoingSegment)');
  l();
  getUnionVariants(findUnionStruct(ir, 'OutgoingSegment')).forEach((variant) => {
    l(`- [ ] \`${variant.tagValue}\` ${variant.description}`);
  });
  return lines.join('\n');
}
