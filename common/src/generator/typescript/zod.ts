import type { IR, IRField } from '@saltify/milky-protocol';

import { getApiTypeNames } from '../shared/ir';
import { normalizeDerivedStructName, snakeCaseToPascalCase } from '../shared/naming';
import { createLineWriter } from '../shared/text';
import { getTypeScriptTypeProjection } from './shared';

const applyDropBadElementArrayStructNames = new Set(['GroupNotification']);

const specialReplacements = new Map([
  [
    'IncomingReplySegmentData.segments',
    ['  get segments() {', "    return z.array(z.lazy(() => IncomingSegment)).describe('回复消息内容');", '  },'].join(
      '\n',
    ),
  ],
  [
    'OutgoingForwardSegmentData.messages',
    [
      '  get messages() {',
      "    return z.array(z.lazy(() => OutgoingForwardedMessage)).describe('转发消息内容');",
      '  },',
    ].join('\n'),
  ],
]);

function formatTypeScriptLiteral(value: unknown): string {
  return JSON.stringify(value).replace(/"/g, "'");
}

function getZodTypeSpec(
  ir: IR,
  field: IRField,
  options: {
    dropBadElementArrayStructNames?: ReadonlySet<string>;
  } = {},
): string {
  let typeSpec = 'z.unknown()';

  if (field.fieldType === 'scalar') {
    if (field.dataType !== undefined) {
      typeSpec = `z${snakeCaseToPascalCase(field.dataType)}`;
    } else if (field.scalarType === 'string') {
      typeSpec = 'z.string()';
    } else if (field.scalarType === 'bool') {
      typeSpec = 'z.boolean()';
    } else {
      typeSpec = 'z.number().int().nonnegative()';
    }
  } else if (field.fieldType === 'enum') {
    typeSpec = `z.enum([${field.values.map((value) => `'${value}'`).join(', ')}])`;
  } else {
    typeSpec = `z.lazy(() => ${field.refStructName})`;
  }

  if (field.isArray) {
    if (field.fieldType === 'ref') {
      const referredStruct = ir.commonStructs.find((struct) => struct.name === field.refStructName);
      if (referredStruct === undefined) {
        throw new Error(`Unknown struct: ${field.refStructName}`);
      }
      if (options.dropBadElementArrayStructNames?.has(referredStruct.name)) {
        typeSpec = `zDropBadElementArray(${field.refStructName})`;
      } else {
        typeSpec = `z.array(${typeSpec})`;
      }
    } else {
      typeSpec = `z.array(${typeSpec})`;
    }
  }

  if (field.isOptional) {
    typeSpec += '.nullish()';
  } else if (field.defaultValue !== undefined) {
    const defaultValueLiteral = formatTypeScriptLiteral(field.defaultValue);
    typeSpec += `.nullish().default(${defaultValueLiteral}).transform<${getTypeScriptTypeProjection(field)}>((val) => val ?? ${defaultValueLiteral})`;
  }

  return typeSpec;
}

function renderIRObject(
  ir: IR,
  name: string,
  fields: IRField[],
  description: string,
  withDescription: boolean = true,
  unionTagFieldName?: string,
  unionTagValue?: string,
): string {
  const writer = createLineWriter();
  const l = writer.line;

  l('z.object({');
  if (unionTagFieldName && unionTagValue) {
    l(`  ${unionTagFieldName}: z.literal('${unionTagValue}'),`);
  }
  fields.forEach((field) => {
    const specialKey = `${name}.${field.name}`;
    if (specialReplacements.has(specialKey)) {
      l(specialReplacements.get(specialKey));
    } else {
      l(
        `  ${field.name}: ${getZodTypeSpec(ir, field, {
          dropBadElementArrayStructNames: applyDropBadElementArrayStructNames,
        })}.describe('${field.description}'),`,
      );
    }
  });
  if (withDescription) {
    l(`}).describe('${description}')`);
  } else {
    l('})');
  }

  return writer.toString();
}

export function generateTypeScriptZodSpec(ir: IR) {
  const writer = createLineWriter();
  const l = writer.line;

  l(`// Generated from Milky ${ir.milkyVersion} (${ir.milkyPackageVersion})`);
  l("import { z } from 'zod';");
  l();
  l(`export const milkyVersion = '${ir.milkyVersion}';`);
  l(`export const milkyPackageVersion = '${ir.milkyPackageVersion}';`);
  l();
  l('export const zUin = z.number().int().min(10001).max(4294967295);');
  l();
  l('export function zDropBadElementArray<const T extends z.ZodDiscriminatedUnion>(element: T) {');
  l('  const schema = z.array(element.catch(null as never)).transform((val) => val.filter((item) => item !== null));');
  l('  return schema as unknown as z.ZodPipe<z.ZodArray<z.ZodCatch<z.ZodLazy<T>>>, z.ZodArray<z.ZodLazy<T>>>;');
  l('}');
  l();
  l('// ####################################');
  l('// Common Structs');
  l('// ####################################');
  l();
  ir.commonStructs.forEach((struct) => {
    if (struct.structType === 'simple') {
      l(`export const ${struct.name} = ${renderIRObject(ir, struct.name, struct.fields, struct.description, true)};`);
      l(`export type ${struct.name} = z.infer<typeof ${struct.name}>;`);
    } else {
      // is union struct
      if (struct.unionType === 'plain') {
        struct.derivedStructs.forEach((derived) => {
          l(
            `export const ${normalizeDerivedStructName(struct.name, derived.tagValue)} = ${renderIRObject(ir, struct.name, derived.fields, derived.description, true, struct.tagFieldName, derived.tagValue)};`,
          );
          l(
            `export type ${normalizeDerivedStructName(struct.name, derived.tagValue)} = z.infer<typeof ${normalizeDerivedStructName(struct.name, derived.tagValue)}>;`,
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
          const structName = `${normalizeDerivedStructName(struct.name, derived.tagValue)}Data`;
          if (derived.derivingType === 'struct') {
            l(
              `export const ${structName} = ${renderIRObject(ir, structName, derived.fields, derived.description, true)};`,
            );
            l(`export type ${structName} = z.infer<typeof ${structName}>;`);
            l();
            // add type aliases for Event
            if (struct.name === 'Event') {
              l(`export const ${normalizeDerivedStructName(struct.name, derived.tagValue)} = ${structName};`);
              l(
                `export type ${normalizeDerivedStructName(struct.name, derived.tagValue)} = z.infer<typeof ${structName}>;`,
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
            l(
              `    ${field.name}: ${getZodTypeSpec(ir, field, {
                dropBadElementArrayStructNames: applyDropBadElementArrayStructNames,
              })}.describe('${field.description}'),`,
            );
          });
          if (derived.derivingType === 'struct') {
            l(
              `    data: ${normalizeDerivedStructName(struct.name, derived.tagValue)}Data.describe('${derived.description}'),`,
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
        l("  type: 'text',");
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
      const typeNames = getApiTypeNames(spec.endpoint);
      if (spec.requestFields) {
        l(
          `export const ${typeNames.inputName} = ` +
            renderIRObject(ir, typeNames.inputName, spec.requestFields, `${spec.endpoint} 请求参数`, true) +
            ';',
        );
        l(`export type ${typeNames.inputName} = z.input<typeof ${typeNames.inputName}>;`);
        l();
      }
      if (spec.responseFields) {
        l(
          `export const ${typeNames.outputName} = ` +
            renderIRObject(ir, typeNames.outputName, spec.responseFields, `${spec.endpoint} 响应数据`, true) +
            ';',
        );
        l(`export type ${typeNames.outputName} = z.output<typeof ${typeNames.outputName}>;`);
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
      const typeNames = getApiTypeNames(spec.endpoint);
      l(`      ${spec.endpoint}: {`);
      l(`        description: '${spec.description}',`);
      l(`        requestSchema: ${spec.requestFields ? typeNames.inputName : 'null'},`);
      l(`        responseSchema: ${spec.responseFields ? typeNames.outputName : 'null'},`);
      l('      },');
    });
    l('    },');
    l('  },');
  });
  l('};');
  l();

  return writer.toString();
}
