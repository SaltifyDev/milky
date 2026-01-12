import { Event, IncomingSegment, milkyPackageVersion, milkyVersion, OutgoingSegment } from '@saltify/milky-types';
import { apiSpecCategories } from '@saltify/milky-types/namings';

export function generateMarkdownRoadmap(): string {
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
  apiSpecCategories.forEach((category) => {
    l(`### ${category.name}`);
    l();
    category.apiSpecs.forEach((spec) => {
      l(`- [ ] \`/${spec.endpoint}\` ${spec.description}`);
    });
    l();
  });
  l('## 事件 (Event)');
  l();
  Event.options.forEach((option) => {
    l(`- [ ] \`${option.shape[Event.def.discriminator].value}\` ${option.description}`);
  });
  l();
  l('## 消息段 (Segment)');
  l();
  l('### 接收消息段 (IncomingSegment)');
  l();
  IncomingSegment.options.forEach((option) => {
    l(`- [ ] \`${option.shape[IncomingSegment.def.discriminator].value}\` ${option.description}`);
  });
  l();
  l('### 发送消息段 (OutgoingSegment)');
  l();
  OutgoingSegment.options.forEach((option) => {
    l(`- [ ] \`${option.shape[OutgoingSegment.def.discriminator].value}\` ${option.description}`);
  });
  return lines.join('\n');
}
