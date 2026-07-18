import type { IR, IRField } from '@saltify/milky-protocol';

import { getApiTypeNames } from '../shared/ir';
import { normalizeDerivedStructName } from '../shared/naming';
import { createLineWriter, formatBlockDocComment } from '../shared/text';
import { getTypeScriptTypeProjection, type TypeScriptTypeProjectionMode } from './shared';

function getZodInputTypeName(name: string): string {
  return `${name}_ZodInput`;
}

function getTypeScriptFieldProjection(field: IRField, mode: TypeScriptTypeProjectionMode): string {
  return getTypeScriptTypeProjection(field, { mode });
}

function isFieldOptionalInProjection(field: IRField, mode: TypeScriptTypeProjectionMode): boolean {
  return field.isOptional || (mode === 'input' && field.defaultValue !== undefined);
}

function renderField(
  l: (line?: string) => void,
  field: IRField,
  mode: TypeScriptTypeProjectionMode,
  indent: string = '  ',
) {
  formatBlockDocComment(field.description, field.since, indent).forEach((line) => {
    l(line);
  });
  l(
    `${indent}${field.name}${isFieldOptionalInProjection(field, mode) ? '?' : ''}: ${getTypeScriptFieldProjection(field, mode)};`,
  );
}

export function generateTypeScriptStaticSpec(ir: IR): string {
  const writer = createLineWriter();
  const l = writer.line;

  l(`// Generated from Milky ${ir.milkyVersion} (${ir.milkyPackageVersion})`);
  l();
  l(`export const milkyVersion = '${ir.milkyVersion}';`);
  l(`export const milkyPackageVersion = '${ir.milkyPackageVersion}';`);
  l();
  l('// ####################################');
  l('// Common Structs');
  l('// ####################################');
  l();
  ir.commonStructs.forEach((struct) => {
    if (struct.structType === 'simple') {
      formatBlockDocComment(struct.description, struct.since).forEach((line) => {
        l(line);
      });
      l(`export interface ${struct.name} {`);
      struct.fields.forEach((field) => {
        renderField(l, field, 'output');
      });
      l('}');
      l();
      formatBlockDocComment(struct.description, struct.since).forEach((line) => {
        l(line);
      });
      l(`export interface ${getZodInputTypeName(struct.name)} {`);
      struct.fields.forEach((field) => {
        renderField(l, field, 'input');
      });
      l('}');
    } else {
      // union
      if (struct.unionType === 'plain') {
        struct.derivedStructs.forEach((derivedStruct) => {
          formatBlockDocComment(derivedStruct.description, derivedStruct.since).forEach((line) => {
            l(line);
          });
          l(`export interface ${normalizeDerivedStructName(struct.name, derivedStruct.tagValue)} {`);
          l(`  /** 数据类型区分字段，表示自身为${derivedStruct.description} */`);
          l(`  ${struct.tagFieldName}: '${derivedStruct.tagValue}';`);
          derivedStruct.fields.forEach((field) => {
            renderField(l, field, 'output');
          });
          l('}');
          l();
          formatBlockDocComment(derivedStruct.description, derivedStruct.since).forEach((line) => {
            l(line);
          });
          l(
            `export interface ${getZodInputTypeName(normalizeDerivedStructName(struct.name, derivedStruct.tagValue))} {`,
          );
          l(`  /** 数据类型区分字段，表示自身为${derivedStruct.description} */`);
          l(`  ${struct.tagFieldName}: '${derivedStruct.tagValue}';`);
          derivedStruct.fields.forEach((field) => {
            renderField(l, field, 'input');
          });
          l('}');
          l();
        });
        formatBlockDocComment(struct.description, struct.since).forEach((line) => {
          l(line);
        });
        l(`export type ${struct.name} =`);
        struct.derivedStructs.forEach((derivedStruct, index) => {
          l(
            `  | ${normalizeDerivedStructName(struct.name, derivedStruct.tagValue)}${index === struct.derivedStructs.length - 1 ? ';' : ''}`,
          );
        });
        l();
        formatBlockDocComment(struct.description, struct.since).forEach((line) => {
          l(line);
        });
        l(`export type ${getZodInputTypeName(struct.name)} =`);
        struct.derivedStructs.forEach((derivedStruct, index) => {
          l(
            `  | ${getZodInputTypeName(normalizeDerivedStructName(struct.name, derivedStruct.tagValue))}${index === struct.derivedStructs.length - 1 ? ';' : ''}`,
          );
        });
      } else {
        // with data property
        struct.derivedTypes.forEach((derivedType) => {
          const derivedStructName = normalizeDerivedStructName(struct.name, derivedType.tagValue);
          formatBlockDocComment(derivedType.description, derivedType.since).forEach((line) => {
            l(line);
          });
          l(`export interface ${derivedStructName} {`);
          l(`  /** 数据类型区分字段，表示自身为${derivedType.description} */`);
          l(`  ${struct.tagFieldName}: '${derivedType.tagValue}';`);
          struct.baseFields.forEach((field) => {
            renderField(l, field, 'output');
          });

          if (derivedType.derivingType === 'struct') {
            l(`  /** 数据内容 */`);
            l(`  data: {`);
            derivedType.fields.forEach((field) => {
              renderField(l, field, 'output', '    ');
            });
            l('  }');
          } else {
            // ref type
            l(`  /** 数据内容 */`);
            l(`  data: ${derivedType.refStructName};`);
          }
          l('}');
          l();
          formatBlockDocComment(derivedType.description, derivedType.since).forEach((line) => {
            l(line);
          });
          l(`export interface ${getZodInputTypeName(derivedStructName)} {`);
          l(`  /** 数据类型区分字段，表示自身为${derivedType.description} */`);
          l(`  ${struct.tagFieldName}: '${derivedType.tagValue}';`);
          struct.baseFields.forEach((field) => {
            renderField(l, field, 'input');
          });

          if (derivedType.derivingType === 'struct') {
            l(`  /** 数据内容 */`);
            l(`  data: {`);
            derivedType.fields.forEach((field) => {
              renderField(l, field, 'input', '    ');
            });
            l('  }');
          } else {
            // ref type
            l(`  /** 数据内容 */`);
            l(`  data: ${getZodInputTypeName(derivedType.refStructName)};`);
          }
          l('}');
          l();
        });
        formatBlockDocComment(struct.description, struct.since).forEach((line) => {
          l(line);
        });
        l(`export type ${struct.name} =`);
        struct.derivedTypes.forEach((derivedType, index) => {
          l(
            `  | ${normalizeDerivedStructName(struct.name, derivedType.tagValue)}${index === struct.derivedTypes.length - 1 ? ';' : ''}`,
          );
        });
        l();
        formatBlockDocComment(struct.description, struct.since).forEach((line) => {
          l(line);
        });
        l(`export type ${getZodInputTypeName(struct.name)} =`);
        struct.derivedTypes.forEach((derivedType, index) => {
          l(
            `  | ${getZodInputTypeName(normalizeDerivedStructName(struct.name, derivedType.tagValue))}${index === struct.derivedTypes.length - 1 ? ';' : ''}`,
          );
        });
      }
    }
    l();
  });

  l('// ####################################');
  l('// API Structs');
  l('// ####################################');
  l();
  ir.apiCategories.forEach((category) => {
    category.apis.forEach((api) => {
      const typeNames = getApiTypeNames(api.endpoint);
      formatBlockDocComment(`${api.description} API 请求参数`, api.since).forEach((line) => {
        l(line);
      });
      if (api.requestFields !== undefined) {
        l(`export interface ${typeNames.inputName} {`);
        api.requestFields.forEach((field) => {
          renderField(l, field, 'output');
        });
        l('}');
      } else {
        l(`export type ${typeNames.inputName} = {};`);
      }
      l();
      formatBlockDocComment(`${api.description} API 请求参数`, api.since).forEach((line) => {
        l(line);
      });
      if (api.requestFields !== undefined) {
        l(`export interface ${getZodInputTypeName(typeNames.inputName)} {`);
        api.requestFields.forEach((field) => {
          renderField(l, field, 'input');
        });
        l('}');
      } else {
        l(`export type ${getZodInputTypeName(typeNames.inputName)} = {};`);
      }
      l();
      formatBlockDocComment(`${api.description} API 响应数据`, api.since).forEach((line) => {
        l(line);
      });
      if (api.responseFields !== undefined) {
        l(`export interface ${typeNames.outputName} {`);
        api.responseFields.forEach((field) => {
          renderField(l, field, 'output');
        });
        l('}');
      } else {
        l(`export type ${typeNames.outputName} = {};`);
      }
      l();
      formatBlockDocComment(`${api.description} API 响应数据`, api.since).forEach((line) => {
        l(line);
      });
      if (api.responseFields !== undefined) {
        l(`export interface ${getZodInputTypeName(typeNames.outputName)} {`);
        api.responseFields.forEach((field) => {
          renderField(l, field, 'input');
        });
        l('}');
      } else {
        l(`export type ${getZodInputTypeName(typeNames.outputName)} = {};`);
      }
      l();
    });
  });
  l('export interface ApiCategories {');
  ir.apiCategories.forEach((category) => {
    l(`  /** ${category.name} */`);
    l(`  ${category.key}: {`);
    category.apis.forEach((api) => {
      const typeNames = getApiTypeNames(api.endpoint);
      formatBlockDocComment(api.description, api.since, '    ').forEach((line) => {
        l(line);
      });
      l(`    ${api.endpoint}: {`);
      l(`      request: ${typeNames.inputName};`);
      l(`      request_ZodInput: ${getZodInputTypeName(typeNames.inputName)};`);
      l(`      response: ${typeNames.outputName};`);
      l(`      response_ZodInput: ${getZodInputTypeName(typeNames.outputName)};`);
      l('    };');
    });
    l('  };');
  });
  l('}');
  l();
  l('export interface ApiEndpoints {');
  ir.apiCategories.forEach((category) => {
    category.apis.forEach((api) => {
      const typeNames = getApiTypeNames(api.endpoint);
      formatBlockDocComment(api.description, api.since, '  ').forEach((line) => {
        l(line);
      });
      l(`  '${api.endpoint}': {`);
      l(`    request: ${typeNames.inputName};`);
      l(`    request_ZodInput: ${getZodInputTypeName(typeNames.inputName)};`);
      l(`    response: ${typeNames.outputName};`);
      l(`    response_ZodInput: ${getZodInputTypeName(typeNames.outputName)};`);
      l('  };');
    });
  });
  l('}');
  l();

  return writer.toString();
}
