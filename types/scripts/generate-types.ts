import { ir, IRField } from '@saltify/milky-protocol';

const preserveFullCapitalizedWords = ['csrf'];

const applyDropBadElementArrayStructs = ['GroupNotification'];

const specialReplacements = new Map([
  [
    'IncomingReplySegmentData.segments',
    '  ' +
      `get segments() {
    return z.array(z.lazy(() => IncomingSegment)).describe('回复消息内容');
  },`.trim(),
  ],
  [
    'OutgoingForwardSegmentData.messages',
    '  ' +
      `get messages() {
    return z.array(z.lazy(() => OutgoingForwardedMessage)).describe('合并转发消息内容');
  },`.trim(),
  ],
]);

function useLines(): [string[], (line?: string) => void] {
  const lines: string[] = [];
  function l(line: string = '') {
    lines.push(line);
  }
  return [lines, l];
}

function snakeCaseToPascalCase(snakeCase: string): string {
  return snakeCase
    .split('_')
    .map((part) =>
      preserveFullCapitalizedWords.includes(part) ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join('');
}

function normalizeDerivedStructName(structName: string, tagValue: string): string {
  // for example: GroupNotification + kick = GroupKickNotification
  const tagValuePascalCase = snakeCaseToPascalCase(tagValue);
  const lastCapitalIndex = structName
    .split('')
    .reverse()
    .findIndex((char) => char >= 'A' && char <= 'Z');
  if (lastCapitalIndex === -1) {
    return structName + tagValuePascalCase;
  }
  const insertPosition = structName.length - lastCapitalIndex - 1;
  return structName.slice(0, insertPosition) + tagValuePascalCase + structName.slice(insertPosition);
}

function getTypeScriptTypeProjection(field: IRField): string {
  if (field.fieldType === 'scalar') {
    if (field.scalarType === 'string') {
      return 'string';
    } else if (field.scalarType === 'bool') {
      return 'boolean';
    } else {
      // is number
      return 'number';
    }
  } else if (field.fieldType === 'enum') {
    return field.values.map((v) => `'${v}'`).join(' | ');
  } else {
    // is ref type
    return field.refStructName;
  }
}

function getZodTypeSpec(field: IRField): string {
  let typeSpec: string = 'z.unknown()';
  if (field.fieldType === 'scalar') {
    if (field.dataType !== undefined) {
      typeSpec = `z${snakeCaseToPascalCase(field.dataType)}`;
    } else {
      if (field.scalarType === 'string') {
        typeSpec = 'z.string()';
      } else if (field.scalarType === 'bool') {
        typeSpec = 'z.boolean()';
      } else {
        // is number
        typeSpec = 'z.number().int().nonnegative()';
      }
    }
  } else if (field.fieldType === 'enum') {
    typeSpec = `z.enum([${field.values.map((v) => `'${v}'`).join(', ')}])`;
  } else {
    // is ref type
    typeSpec = `z.lazy(() => ${field.refStructName})`;
  }

  if (field.isArray) {
    if (field.fieldType === 'ref') {
      const referredStruct = ir.commonStructs.find((s) => s.name === field.refStructName)!;
      if (applyDropBadElementArrayStructs.includes(referredStruct.name)) {
        typeSpec = `zDropBadElementArray(${field.refStructName})`;
      } else {
        typeSpec = `z.array(${typeSpec})`;
      }
    } else {
      typeSpec = `z.array(${typeSpec})`;
    }
  }

  // optional and default value are exclusive
  if (field.isOptional) {
    typeSpec += '.nullish()';
  } else if (field.defaultValue !== undefined) {
    // eslint-disable-next-line quotes
    typeSpec += `.nullish().default(${JSON.stringify(field.defaultValue).replace(/"/g, "'")}).transform<${getTypeScriptTypeProjection(field)}>((val) => val ?? ${JSON.stringify(field.defaultValue).replace(/"/g, "'")})`;
  }

  return typeSpec;
}

function renderIRObject(
  name: string,
  fields: IRField[],
  description: string,
  withDescription: boolean = true,
  unionTagFieldName?: string,
  unionTagValue?: string
): string {
  const [lines, l] = useLines();

  l('z.object({');
  if (unionTagFieldName && unionTagValue) {
    l(`  ${unionTagFieldName}: z.literal('${unionTagValue}'),`);
  }
  fields.forEach((field) => {
    const specialKey = `${name}.${field.name}`;
    if (specialReplacements.has(specialKey)) {
      l(specialReplacements.get(specialKey));
    } else {
      l(`  ${field.name}: ${getZodTypeSpec(field)}.describe('${field.description}'),`);
    }
  });
  if (withDescription) {
    l(`}).describe('${description}')`);
  } else {
    l('})');
  }

  return lines.join('\n');
}

function generateTypeScriptZodSpec() {
  const [lines, l] = useLines();

  l(`// Generated from Milky ${ir.milkyVersion} (${ir.milkyPackageVersion})`);
  l(
    `
import { z } from 'zod';

export const milkyVersion = '${ir.milkyVersion}';
export const milkyPackageVersion = '${ir.milkyPackageVersion}';

export const zUin = z.number().int().min(10001).max(4294967295);

export function zDropBadElementArray<const T extends z.ZodDiscriminatedUnion>(element: T) {
  const schema = z.array(element.catch(null as never)).transform((val) => val.filter((item) => item !== null));
  return schema as unknown as z.ZodPipe<z.ZodArray<z.ZodCatch<z.ZodLazy<T>>>, z.ZodArray<z.ZodLazy<T>>>;
}
    `.trim()
  );
  l();
  l('// ####################################');
  l('// Common Structs');
  l('// ####################################');
  l();
  ir.commonStructs.forEach((struct) => {
    if (struct.structType === 'simple') {
      l(`export const ${struct.name} = ${renderIRObject(struct.name, struct.fields, struct.description, true)};`);
      l(`export type ${struct.name} = z.infer<typeof ${struct.name}>;`);
    } else {
      // is union struct
      if (struct.unionType === 'plain') {
        struct.derivedStructs.forEach((derived) => {
          l(
            `export const ${normalizeDerivedStructName(struct.name, derived.tagValue)} = ${renderIRObject(struct.name, derived.fields, derived.description, true, struct.tagFieldName, derived.tagValue)};`
          );
          l(
            `export type ${normalizeDerivedStructName(struct.name, derived.tagValue)} = z.infer<typeof ${normalizeDerivedStructName(struct.name, derived.tagValue)}>;`
          );
          l();
        });
        l(`export const ${struct.name} = z.discriminatedUnion('${struct.tagFieldName}', [`);
        struct.derivedStructs.forEach((derived) => {
          l(`  ${normalizeDerivedStructName(struct.name, derived.tagValue)},`);
        });
      } else {
        // with data property
        struct.derivedTypes.forEach((derived) => {
          const structName = normalizeDerivedStructName(struct.name, derived.tagValue) + 'Data';
          if (derived.derivingType === 'struct') {
            l(`export const ${structName} = ${renderIRObject(structName, derived.fields, derived.description, true)};`);
            l(`export type ${structName} = z.infer<typeof ${structName}>;`);
            l();
            // add type aliases for Event
            if (struct.name === 'Event') {
              l(`export const ${normalizeDerivedStructName(struct.name, derived.tagValue)} = ${structName};`);
              l(
                `export type ${normalizeDerivedStructName(struct.name, derived.tagValue)} = z.infer<typeof ${structName}>;`
              );
              l();
            }
          }
        });
        l(`export const ${struct.name} = z.discriminatedUnion('${struct.tagFieldName}', [`);
        struct.derivedTypes.forEach((derived, index) => {
          l('  z.object({');
          l(`    ${struct.tagFieldName}: z.literal('${derived.tagValue}'),`);
          struct.baseFields.forEach((field) => {
            l(`    ${field.name}: ${getZodTypeSpec(field)}.describe('${field.description}'),`);
          });
          if (derived.derivingType === 'struct') {
            l(
              `    data: ${normalizeDerivedStructName(struct.name, derived.tagValue)}Data.describe('${derived.description}'),`
            );
            l(`  }).describe('${derived.description}'),`);
          } else {
            // ref type
            l(`    data: z.lazy(() => ${derived.refStructName}).describe('${derived.description}'),`);
            l(`  }).describe('${derived.description}'),`);
          }
          if (index !== struct.derivedTypes.length - 1) {
            l();
          }
        });
      }
      if (struct.name === 'IncomingSegment') {
        l(']).catch({');
        // eslint-disable-next-line quotes
        l("  type: 'text',");
        // eslint-disable-next-line quotes
        l("  data: { text: '[unknown]' },");
        l(`}).describe('${struct.description}');`);
      } else {
        l(`]).describe('${struct.description}');`);
      }
      l(`export type ${struct.name} = z.infer<typeof ${struct.name}>;`);
    }
    l();
  });

  l('// ####################################');
  l('// API Structs');
  l('// ####################################');
  l();
  ir.apiCategories.forEach((category) => {
    category.apis.forEach((spec) => {
      const pascalEndpoint = snakeCaseToPascalCase(spec.endpoint);
      if (spec.requestFields) {
        l(
          `export const ${pascalEndpoint}Input = ` +
            renderIRObject(`${pascalEndpoint}Input`, spec.requestFields, spec.endpoint + ' 请求参数', true) +
            ';'
        );
        l(`export type ${pascalEndpoint}Input = z.infer<typeof ${pascalEndpoint}Input>;`);
        l();
      }
      if (spec.responseFields) {
        l(
          `export const ${pascalEndpoint}Output = ` +
            renderIRObject(`${pascalEndpoint}Output`, spec.responseFields, spec.endpoint + ' 响应数据', true) +
            ';'
        );
        l(`export type ${pascalEndpoint}Output = z.infer<typeof ${pascalEndpoint}Output>;`);
        l();
      }
    });
  });
  l('// ####################################');
  l('// Meta Information');
  l('// ####################################');
  l();
  l('export const zodCommonStructs = {');
  ir.commonStructs.forEach((struct) => {
    l(`  ${struct.name},`);
  });
  l('};');
  l();
  l('export const zodApiCategories = {');
  ir.apiCategories.forEach((category) => {
    l(`  ${category.key}: {`);
    l(`    name: '${category.name}',`);
    l('    apis: {');
    category.apis.forEach((spec) => {
      l(`      ${spec.endpoint}: {`);
      l(`        description: '${spec.description}',`);
      l(`        requestSchema: ${spec.requestFields ? `${snakeCaseToPascalCase(spec.endpoint)}Input` : 'null'},`);
      l(`        responseSchema: ${spec.responseFields ? `${snakeCaseToPascalCase(spec.endpoint)}Output` : 'null'},`);
      l('      },');
    });
    l('    },');
    l('  },');
  });
  l('};');

  return lines.join('\n');
}

console.log(generateTypeScriptZodSpec());
