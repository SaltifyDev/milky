import * as t from '@saltify/milky-types';
import z from 'zod';

export function generateJsonSchema() {
  const idRegistry = z.registry<{ id: string }>();
  const seenObjects = new WeakSet();
  Object.entries(t).forEach(([key, value]) => {
    if (value instanceof z.ZodType && !seenObjects.has(value)) {
      seenObjects.add(value);
      idRegistry.add(value, { id: key });
    }
  });
  return {
    milkyVersion: t.milkyVersion,
    packageVersion: t.milkyPackageVersion,
    schemas: z.toJSONSchema(idRegistry, {
      metadata: z.globalRegistry,
      io: 'input',
    }).schemas,
  };
}
