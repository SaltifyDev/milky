import { apiCategories, commonStructs } from '@/app/common';
import { z } from 'zod';
import { $ZodType } from 'zod/v4/core';
import { milkyVersion, milkyPackageVersion } from '@saltify/milky-types';

export const dynamic = 'force-static';

const commonStructNames = new Map<$ZodType, string>(
  Object.entries(commonStructs).map(([name, struct]) => [struct, name])
);

function toLowerCamelCase(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toUpperCamelCase(s: string): string {
  const lower = toLowerCamelCase(s);
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function formatDartLiteral(value: unknown): string {
  return JSON.stringify(value);
}

function formatDocComment(text: string): string[] {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return lines.map((line) => `/// ${line}`);
}

function unwrapZodType(type: $ZodType): {
  type: $ZodType;
  isOptional: boolean;
  isNullable: boolean;
  defaultValue?: unknown;
} {
  let current: $ZodType = type;
  let isOptional = false;
  let isNullable = false;
  let defaultValue: unknown = undefined;

  while (true) {
    if (current instanceof z.ZodOptional) {
      isOptional = true;
      current = current.unwrap();
      continue;
    }
    if (current instanceof z.ZodNullable) {
      isNullable = true;
      current = current.unwrap();
      continue;
    }
    if (current instanceof z.ZodDefault) {
      defaultValue =
        typeof current.def.defaultValue === 'function' ? current.def.defaultValue() : current.def.defaultValue;
      current = current.unwrap();
      continue;
    }
    if (current instanceof z.ZodPipe) {
      current = current.def.in;
      continue;
    }
    if ('innerType' in current && typeof current.innerType === 'function') {
      current = current.innerType();
      continue;
    }
    if (current instanceof z.ZodLazy) {
      current = current.unwrap();
      continue;
    }
    break;
  }

  return { type: current, isOptional, isNullable, defaultValue };
}

function getDartTypeSpec(type: $ZodType): string {
  if (type instanceof z.ZodArray) {
    return `List<${getDartTypeSpec(type.element)}>`;
  }
  if (type instanceof z.ZodNumber) {
    return 'int';
  }
  if (type instanceof z.ZodBoolean) {
    return 'bool';
  }
  if (type instanceof z.ZodString || type instanceof z.ZodEnum) {
    return 'String';
  }
  if (type instanceof z.ZodLazy) {
    return getDartTypeSpec(type.unwrap());
  }
  if (commonStructNames.has(type)) {
    return toUpperCamelCase(commonStructNames.get(type)!);
  }

  throw new Error('Unsupported schema type');
}

function renderFieldLines(key: string, schema: z.ZodType, typeOverride?: string): string[] {
  const lines: string[] = [];
  const fieldName = toLowerCamelCase(key);
  const unwrapped = unwrapZodType(schema);
  const description = schema.description ?? (unwrapped.type as z.ZodType).description;
  const baseType = typeOverride ?? getDartTypeSpec(unwrapped.type);
  const hasDefault = unwrapped.defaultValue !== undefined;
  const isNullable = (unwrapped.isOptional || unwrapped.isNullable) && !hasDefault;
  const dartType = isNullable ? `${baseType}?` : baseType;
  const isRequired = !isNullable && !hasDefault;

  if (description) {
    formatDocComment(description).forEach((line) => lines.push(line));
  }
  if (hasDefault) {
    lines.push(`@Default(${formatDartLiteral(unwrapped.defaultValue)})`);
  }
  lines.push(`@JsonKey(name: "${key}")`);
  lines.push(`${isRequired ? 'required ' : ''}${dartType} ${fieldName},`);

  return lines;
}

function renderZodObject(name: string, schema: z.ZodObject): string {
  const className = toUpperCamelCase(name);
  const entries = Object.entries(schema.shape);
  const lines: string[] = [];

  lines.push('@freezed');
  lines.push(`abstract class ${className} with _$${className} {`);
  if (entries.length === 0) {
    lines.push(`  const factory ${className}() = _${className};`);
  } else {
    lines.push(`  const factory ${className}({`);
    entries.forEach(([key, value]) => {
      renderFieldLines(key, value).forEach((line) => {
        lines.push(`    ${line}`);
      });
    });
    lines.push(`  }) = _${className};`);
  }
  lines.push('');
  lines.push(`  factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);`);
  lines.push('}');

  return lines.join('\n');
}

function renderZodDiscriminatedUnion(
  name: string,
  struct: z.ZodDiscriminatedUnion
): { union: string; extraDefs: string[] } {
  const className = toUpperCamelCase(name);
  const lines: string[] = [];
  const extraDefs: string[] = [];
  const options = struct.options;
  const discriminator = struct.def.discriminator;

  const keysList = options.map((option) => {
    if (option instanceof z.ZodObject) {
      return Object.keys(option.shape);
    }
    throw new Error('Expected ZodDiscriminatedUnion to contain ZodObject');
  });

  const hasCommonKeys =
    keysList.length > 0 &&
    keysList.every((keys) => keys.length === keysList[0].length && keys.every((key) => keysList[0].includes(key)));

  lines.push(`@Freezed(unionKey: "${discriminator}")`);
  lines.push(`abstract class ${className} with _$${className} {`);

  if (hasCommonKeys) {
    if (!keysList[0].includes('data')) {
      throw new Error('Expected all options to have a "data" field');
    }
    const commonKeys = keysList[0].filter((key) => key !== 'data' && key !== discriminator);
    const firstOption = options[0] as z.ZodObject;

    options.forEach((option, index) => {
      if (!(option instanceof z.ZodObject)) {
        throw new Error('Expected option to be a ZodObject');
      }
      const variantValue = (option.shape[discriminator] as z.ZodLiteral).value as string;
      const variantConstructor = toLowerCamelCase(variantValue);
      const variantClassName = `${className}${toUpperCamelCase(variantValue)}`;
      const dataField = option.shape['data'];
      let dataTypeName: string;

      if (commonStructNames.has(dataField)) {
        dataTypeName = toUpperCamelCase(commonStructNames.get(dataField)!);
      } else if (dataField instanceof z.ZodObject) {
        dataTypeName = `${className}${toUpperCamelCase(variantValue)}Data`;
        extraDefs.push(renderZodObject(dataTypeName, dataField));
      } else {
        dataTypeName = getDartTypeSpec(unwrapZodType(dataField).type);
      }

      lines.push(`  @FreezedUnionValue("${variantValue}")`);
      lines.push(`  const factory ${className}.${variantConstructor}({`);
      commonKeys.forEach((key) => {
        renderFieldLines(key, firstOption.shape[key]).forEach((line) => {
          lines.push(`    ${line}`);
        });
      });
      renderFieldLines('data', dataField, dataTypeName).forEach((line) => {
        lines.push(`    ${line}`);
      });
      lines.push(`  }) = ${variantClassName};`);
      if (index !== options.length - 1) {
        lines.push('');
      }
    });
  } else {
    options.forEach((option, index) => {
      if (!(option instanceof z.ZodObject)) {
        throw new Error('Expected option to be a ZodObject');
      }
      const variantValue = (option.shape[discriminator] as z.ZodLiteral).value as string;
      const variantConstructor = toLowerCamelCase(variantValue);
      const variantClassName = `${className}${toUpperCamelCase(variantValue)}`;

      lines.push(`  @FreezedUnionValue("${variantValue}")`);
      lines.push(`  const factory ${className}.${variantConstructor}({`);
      Object.entries(option.shape).forEach(([key, value]) => {
        if (key === discriminator) {
          return;
        }
        renderFieldLines(key, value).forEach((line) => {
          lines.push(`    ${line}`);
        });
      });
      lines.push(`  }) = ${variantClassName};`);
      if (index !== options.length - 1) {
        lines.push('');
      }
    });
  }

  lines.push('');
  lines.push(`  factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);`);
  lines.push('}');

  return { union: lines.join('\n'), extraDefs };
}

function generateDartSpec(): string {
  const lines: string[] = [];
  function l(line: string = '') {
    lines.push(line);
  }

  l('// Auto-generated file');
  l('// ignore_for_file: invalid_annotation_target');
  l(`// Generated from Milky ${milkyVersion} (${milkyPackageVersion})`);
  l('');
  l("import 'package:freezed_annotation/freezed_annotation.dart';");
  l('');
  l("part 'milky_types.freezed.dart';");
  l("part 'milky_types.g.dart';");
  l('');
  l(`const milkyVersion = "${milkyVersion}";`);
  l(`const milkyPackageVersion = "${milkyPackageVersion}";`);
  l('');

  l('@freezed');
  l('abstract class ApiGeneralResponse with _$ApiGeneralResponse {');
  l('  const factory ApiGeneralResponse({');
  l('    @JsonKey(name: "status") required String status,');
  l('    @JsonKey(name: "retcode") required int retcode,');
  l('    @JsonKey(name: "data") Object? data,');
  l('    @JsonKey(name: "message") String? message,');
  l('  }) = _ApiGeneralResponse;');
  l('');
  l('  factory ApiGeneralResponse.fromJson(Map<String, dynamic> json) => _$ApiGeneralResponseFromJson(json);');
  l('}');
  l('');

  l('@freezed');
  l('abstract class ApiEmptyStruct with _$ApiEmptyStruct {');
  l('  const factory ApiEmptyStruct() = _ApiEmptyStruct;');
  l('');
  l('  factory ApiEmptyStruct.fromJson(Map<String, dynamic> json) => _$ApiEmptyStructFromJson(json);');
  l('}');
  l('');

  l('// ####################################');
  l('// Common Structs');
  l('// ####################################');
  l('');
  Object.entries(commonStructs).forEach(([name, schema]) => {
    if (schema instanceof z.ZodObject) {
      l(renderZodObject(name, schema));
    } else if (schema instanceof z.ZodDiscriminatedUnion) {
      const rendered = renderZodDiscriminatedUnion(name, schema);
      l(rendered.union);
      if (rendered.extraDefs.length > 0) {
        l('');
        rendered.extraDefs.forEach((def) => {
          l(def);
          l('');
        });
      } else {
        l('');
      }
    } else {
      throw new Error('Unsupported schema type');
    }
    l('');
  });

  l('// ####################################');
  l('// API Input and Output Structs');
  l('// ####################################');
  l('');
  Object.entries(apiCategories).forEach(([, category]) => {
    l(`// ---- ${category.name} ----`);
    l('');
    category.apis.forEach((api) => {
      const inputName = `${toUpperCamelCase(api.endpoint)}Input`;
      if (api.inputStruct instanceof z.ZodObject) {
        if (Object.keys(api.inputStruct.shape).length > 0) {
          l(renderZodObject(inputName, api.inputStruct));
        } else {
          l(`typedef ${inputName} = ApiEmptyStruct;`);
        }
      } else {
        throw new Error('Unsupported input schema type');
      }
      l('');

      const outputName = `${toUpperCamelCase(api.endpoint)}Output`;
      if (api.outputStruct instanceof z.ZodObject) {
        if (Object.keys(api.outputStruct.shape).length > 0) {
          l(renderZodObject(outputName, api.outputStruct));
        } else {
          l(`typedef ${outputName} = ApiEmptyStruct;`);
        }
      } else if (api.outputStruct instanceof z.ZodVoid) {
        l(`typedef ${outputName} = ApiEmptyStruct;`);
      } else {
        throw new Error('Unsupported output schema type');
      }
      l('');
    });
  });

  return lines.join('\n');
}

export function GET() {
  return new Response(generateDartSpec());
}
