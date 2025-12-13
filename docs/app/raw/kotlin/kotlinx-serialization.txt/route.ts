import { commonStructs, apiCategories } from '../../../common';
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

function indentLines(text: string, indent: string = '    '): string {
  return text
    .split('\n')
    .map((line) => (line.trim() ? indent + line : line))
    .join('\n');
}

function getKotlinTypeSpec(type: $ZodType): string {
  if (type instanceof z.ZodArray) {
    return `List<${getKotlinTypeSpec(type.element)}>`;
  }
  if (type instanceof z.ZodNumber) {
    if (type.meta()?.scalarType === 'int64') {
      return 'Long';
    }
    return 'Int';
    //throw new Error('Unsupported number type');
  }
  if (type instanceof z.ZodBoolean) {
    return 'Boolean';
  }
  if (type instanceof z.ZodString || type instanceof z.ZodEnum) {
    return 'String';
  }
  if (type instanceof z.ZodNullable) {
    return getKotlinTypeSpec(type.unwrap()); // unwrap only once, since we only use z.nullish()
  }
  if (type instanceof z.ZodPipe) {
    return getKotlinTypeSpec(type.def.in);
  }
  if (type instanceof z.ZodOptional) {
    return `${getKotlinTypeSpec(type.unwrap())}? = null`;
  }
  if (type instanceof z.ZodDefault) {
    let unwrapped = type.unwrap();
    if (unwrapped instanceof z.ZodOptional) {
      unwrapped = unwrapped.unwrap();
    }
    if (unwrapped instanceof z.ZodNullable) {
      unwrapped = unwrapped.unwrap();
    }
    return `${getKotlinTypeSpec(unwrapped)} = ${JSON.stringify(type.def.defaultValue)}`;
  }
  if (type instanceof z.ZodLazy) {
    return getKotlinTypeSpec(type.unwrap());
  }
  if (commonStructNames.has(type)) {
    return toUpperCamelCase(commonStructNames.get(type)!);
  }

  throw new Error('Unsupported schema type');
}

function renderZodObject(
  name: string,
  schema: z.ZodObject,
  includeDesc = true,
  filterOutKeys: string[] = [],
  additionalAnnotations: string[] = []
): string {
  const lines: string[] = [];
  function l(line: string = '') {
    lines.push(line);
  }
  if (includeDesc) {
    l(`/** ${schema.description} */`);
  }
  l('@Serializable');
  additionalAnnotations.forEach((annotation) => l(annotation));
  l(`class ${toUpperCamelCase(name)}(`);
  const shape = schema.shape;
  Object.entries(shape).forEach(([key, value]) => {
    if (filterOutKeys.includes(key)) {
      return;
    }
    l(`    /** ${value.description ?? ''} */`);
    l(`    @SerialName("${key}") val ${toLowerCamelCase(key)}: ${getKotlinTypeSpec(value)},`);
  });
  l(')');
  return lines.join('\n');
}

function renderZodDiscriminatedUnion(name: string, struct: z.ZodDiscriminatedUnion): string {
  const lines: string[] = [];
  function l(line: string = '') {
    lines.push(line);
  }
  function a(line: string = '') {
    lines[lines.length - 1] += line;
  }

  l(`/** ${struct.description} */`);
  l('@Serializable');

  const keysList = struct.options.map((option) => {
    if (option instanceof z.ZodObject) {
      return Object.keys(option.shape);
    } else {
      throw new Error('Expected ZodDiscriminatedUnion to contain ZodObject');
    }
  });

  l(`@JsonClassDiscriminator("${struct.def.discriminator}")`);
  l(`sealed class ${toUpperCamelCase(name)} {`);
  if (keysList.every((keys) => keys.length === keysList[0].length && keys.every((key) => keysList[0].includes(key)))) {
    if (!keysList[0].includes('data')) {
      throw new Error('Expected all options to have a "data" field');
    }
    const commonKeys = keysList[0].filter((key) => key !== 'data' && key !== struct.def.discriminator);
    const firstOption = struct.options[0];
    if (!(firstOption instanceof z.ZodObject)) {
      throw new Error('Expected first option to be a ZodObject');
    }

    struct.options.forEach((option, index) => {
      if (!(option instanceof z.ZodObject)) {
        throw new Error('Expected option to be a ZodObject');
      }
      const dataField = option.shape['data'];
      l(`    /** ${option.description} */`);
      l('    @Serializable');
      l(`    @SerialName("${(option.shape[struct.def.discriminator] as z.ZodLiteral).value}")`);
      l(`    class ${toUpperCamelCase((option.shape[struct.def.discriminator] as z.ZodLiteral).value as string)}(`);
      commonKeys.forEach((key) => {
        const field = firstOption.shape[key];
        l(`        /** ${field.description ?? ''} */`);
        l(`        @SerialName("${key}") val ${toLowerCamelCase(key)}: ${getKotlinTypeSpec(field)},`);
      });
      l(`        /** 数据字段 */`);
      l(`        @SerialName("data") val data: ${commonStructNames.get(dataField) ?? 'Data'}`);
      l(`    ) : ${toUpperCamelCase(name)}()`);
      if (!commonStructNames.has(dataField)) {
        a(' {');
        l(indentLines(renderZodObject('Data', dataField as z.ZodObject, false), '        '));
        l('    }');
      }
      if (index !== struct.options.length - 1) {
        l('');
      }
    });
  } else {
    struct.options.forEach((option, index) => {
      if (!(option instanceof z.ZodObject)) {
        throw new Error('Expected option to be a ZodObject');
      }
      l(`    /** ${option.description} */`);
      l(
        indentLines(
          renderZodObject(
            (option.shape[struct.def.discriminator] as z.ZodLiteral).value as string,
            option,
            false,
            [struct.def.discriminator],
            [`@SerialName("${(option.shape[struct.def.discriminator] as z.ZodLiteral).value}")`]
          ),
          '    '
        ) + ` : ${toUpperCamelCase(name)}()`
      );
      if (index !== struct.options.length - 1) {
        l('');
      }
    });
  }

  l('}');

  return lines.join('\n');
}

function generateKotlinSpec(): string {
  const lines: string[] = [];
  function l(line: string = '') {
    lines.push(line);
  }
  function a(line: string = '') {
    lines[lines.length - 1] += line;
  }
  l('// Auto-generated file');
  l('@file:OptIn(ExperimentalSerializationApi::class)');
  l('');
  l('package org.ntqqrev.milky');
  l('');
  l('import kotlinx.serialization.Serializable');
  l('import kotlinx.serialization.*');
  l('import kotlinx.serialization.json.*');
  l('');

  l(`const val milkyVersion = "${milkyVersion}"`);
  l(`const val milkyPackageVersion = "${milkyPackageVersion}"`);
  l('');

  l('val milkyJsonModule = Json {');
  l('    ignoreUnknownKeys = true');
  l('    explicitNulls = false');
  l('}');
  l('');

  l('// ####################################');
  l('// Common Structs');
  l('// ####################################');
  l('');
  Object.entries(commonStructs).forEach(([name, schema]) => {
    if (schema instanceof z.ZodObject) {
      l(renderZodObject(name, schema));
    }
    if (schema instanceof z.ZodDiscriminatedUnion) {
      l(renderZodDiscriminatedUnion(name, schema));
    }
    l('');
  });

  l('// ####################################');
  l('// API Input and Output Structs');
  l('// ####################################');
  l('');
  l('@Serializable');
  l('class ApiGeneralResponse(');
  l('    @SerialName("status") val status: String,');
  l('    @SerialName("retcode") val retcode: Int,');
  l('    @SerialName("data") val data: JsonElement? = null,');
  l('    @SerialName("message") val message: String? = null,');
  l(')');
  l('');
  l('@Serializable');
  l('class ApiEmptyStruct');
  l('');
  Object.entries(apiCategories).forEach(([, category]) => {
    l(`// ---- ${category.name} ----`);
    l('');
    category.apis.forEach((api) => {
      if (api.inputStruct instanceof z.ZodObject) {
        if (Object.keys(api.inputStruct.shape).length > 0) {
          l(renderZodObject(`${toUpperCamelCase(api.endpoint)}Input`, api.inputStruct, false));
        } else {
          l(`typealias ${toUpperCamelCase(api.endpoint)}Input = ApiEmptyStruct`);
        }
      }
      l('');
      if (api.outputStruct instanceof z.ZodObject) {
        l(renderZodObject(`${toUpperCamelCase(api.endpoint)}Output`, api.outputStruct, false));
      } else {
        l(`typealias ${toUpperCamelCase(api.endpoint)}Output = ApiEmptyStruct`);
      }
      l('');
    });
  });

  l('// ####################################');
  l('// API Endpoint Constants');
  l('// ####################################');
  l('');
  l('sealed class ApiEndpoint<T : Any, R : Any>(val path: String) {');
  Object.entries(apiCategories).forEach(([, category]) => {
    category.apis.forEach((api) => {
      l(`    /** ${api.description} */`);
      l(
        `    object ${toUpperCamelCase(api.endpoint)} : ApiEndpoint<${toUpperCamelCase(
          api.endpoint
        )}Input, ${toUpperCamelCase(api.endpoint)}Output>("/${api.endpoint}")`
      );
    });
  });
  l('}');

  return lines.join('\n');
}

export function GET() {
  return new Response(generateKotlinSpec());
}
