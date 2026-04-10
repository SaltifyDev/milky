import { IR } from '@saltify/milky-protocol';
import { getApiTypeNames } from '../shared/ir';
import { normalizeDerivedStructName } from '../shared/naming';
import { createLineWriter } from '../shared/text';
import { getTypeScriptTypeProjection } from './shared';

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
      l(`/** ${struct.description} */`);
      l(`export interface ${struct.name} {`);
      struct.fields.forEach((field) => {
        l(`  /** ${field.description} */`);
        l(`  ${field.name}${field.isOptional ? '?' : ''}: ${getTypeScriptTypeProjection(field)};`);
      });
      l('}');
    } else {
      // union
      if (struct.unionType === 'plain') {
        struct.derivedStructs.forEach((derivedStruct) => {
          l(`/** ${derivedStruct.description} */`);
          l(`export interface ${normalizeDerivedStructName(struct.name, derivedStruct.tagValue)} {`);
          l(`  /** 数据类型区分字段，表示自身为${derivedStruct.description} */`);
          l(`  ${struct.tagFieldName}: '${derivedStruct.tagValue}';`);
          derivedStruct.fields.forEach((field) => {
            l(`  /** ${field.description} */`);
            l(`  ${field.name}${field.isOptional ? '?' : ''}: ${getTypeScriptTypeProjection(field)};`);
          });
          l('}');
          l();
        });
        l(`/** ${struct.description} */`);
        l(`export type ${struct.name} =`);
        struct.derivedStructs.forEach((derivedStruct, index) => {
          l(
            `  | ${normalizeDerivedStructName(struct.name, derivedStruct.tagValue)}${index === struct.derivedStructs.length - 1 ? ';' : ''}`
          );
        });
      } else {
        // with data property
        struct.derivedTypes.forEach((derivedType) => {
          l(`/** ${derivedType.description} */`);
          if (derivedType.derivingType === 'struct') {
            l(`export interface ${normalizeDerivedStructName(struct.name, derivedType.tagValue)}Data {`);
            derivedType.fields.forEach((field) => {
              l(`  /** ${field.description} */`);
              l(`  ${field.name}${field.isOptional ? '?' : ''}: ${getTypeScriptTypeProjection(field)};`);
            });
            l('}');
          } else {
            // ref type
            l(
              `export type ${normalizeDerivedStructName(struct.name, derivedType.tagValue)}Data = ${derivedType.refStructName};`
            );
          }
          // add type aliases for Event
          if (struct.name === 'Event') {
            l(`/** ${derivedType.description} */`);
            l(
              `export type ${normalizeDerivedStructName(struct.name, derivedType.tagValue)} = ${normalizeDerivedStructName(struct.name, derivedType.tagValue)}Data;`
            );
          }
          l();
        });
        l(`/** ${struct.description} */`);
        l(`export type ${struct.name} =`);
        struct.derivedTypes.forEach((derivedType, index) => {
          l('  | {');
          l(`      ${struct.tagFieldName}: '${derivedType.tagValue}';`);
          l(`      data: ${normalizeDerivedStructName(struct.name, derivedType.tagValue)}Data;`);
          l(`    }${index === struct.derivedTypes.length - 1 ? ';' : ''}`);
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
      l(`/** ${api.description} API 请求参数 */`);
      if (api.requestFields !== undefined) {
        l(`export interface ${typeNames.requestName} {`);
        api.requestFields.forEach((field) => {
          l(`  /** ${field.description} */`);
          l(`  ${field.name}${field.isOptional ? '?' : ''}: ${getTypeScriptTypeProjection(field)};`);
        });
        l('}');
      } else {
        l(`export type ${typeNames.requestName} = {};`);
      }
      l();
      l(`/** ${api.description} API 响应数据 */`);
      if (api.responseFields !== undefined) {
        l(`export interface ${typeNames.responseName} {`);
        api.responseFields.forEach((field) => {
          l(`  /** ${field.description} */`);
          l(`  ${field.name}${field.isOptional ? '?' : ''}: ${getTypeScriptTypeProjection(field)};`);
        });
        l('}');
      } else {
        l(`export type ${typeNames.responseName} = {};`);
      }
      l();
    });
  });

  return writer.toString();
}
