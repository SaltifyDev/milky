import { IRField, IRStruct } from '@common/ir/types';
import { milkyPackageVersion, milkyVersion } from '@saltify/milky-types';
import { generateIR } from '@common/ir';

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

function escapeString(str: string): string {
  return str.replace(/"/g, '\\"');
}

function getKotlinTypeSpec(field: IRField): string {
  let baseType: string;
  if (field.fieldType === 'scalar') {
    if (field.scalarType === 'bool') {
      baseType = 'Boolean';
    } else if (field.scalarType === 'string') {
      baseType = 'String';
    } else if (field.scalarType === 'int64') {
      baseType = 'Long';
    } else {
      baseType = 'Int';
    }
  } else if (field.fieldType === 'enum') {
    baseType = 'String';
  } else {
    baseType = toUpperCamelCase(field.refStructName);
  }

  const typeSpec = field.isArray ? `List<${baseType}>` : baseType;
  if (field.defaultValue !== undefined) {
    return `${typeSpec} = ${JSON.stringify(field.defaultValue)}`;
  }
  if (field.isOptional) {
    return `${typeSpec}? = null`;
  }
  return typeSpec;
}

function renderIRObject(
  name: string,
  fields: IRField[],
  description: string,
  includeDesc = true,
  additionalAnnotations: string[] = []
): string {
  const lines: string[] = [];
  function l(line: string = '') {
    lines.push(line);
  }
  if (includeDesc && description) {
    l(`/** ${description} */`);
  }
  l('@Serializable');
  additionalAnnotations.forEach((annotation) => l(annotation));
  l(`class ${toUpperCamelCase(name)}(`);
  fields.forEach((field) => {
    const defaultValue = field.defaultValue !== undefined ? JSON.stringify(field.defaultValue) : null;
    l(`    /** ${field.description ?? ''} */`);
    l(
      `    @SerialName("${field.name}")${
        defaultValue ? ` @LiteralDefault("${escapeString(defaultValue)}")` : ''
      } val ${toLowerCamelCase(field.name)}: ${getKotlinTypeSpec(field)},`
    );
  });
  l(')');
  return lines.join('\n');
}

function renderIRUnionStruct(struct: IRStruct): string {
  if (struct.structType !== 'union') {
    throw new Error('Expected union struct');
  }

  const name = struct.name;
  const lines: string[] = [];
  function l(line: string = '') {
    lines.push(line);
  }
  function a(line: string = '') {
    lines[lines.length - 1] += line;
  }

  if (struct.description) {
    l(`/** ${struct.description} */`);
  }
  l('@Serializable');

  l(`@JsonClassDiscriminator("${struct.tagFieldName}")`);
  l(`sealed class ${toUpperCamelCase(name)} {`);
  if (struct.unionType === 'withData') {
    struct.derivedTypes.forEach((derivedType, index) => {
      const variantName = toUpperCamelCase(derivedType.tagValue);
      const dataTypeName = derivedType.derivingType === 'ref' ? toUpperCamelCase(derivedType.refStructName) : 'Data';
      if (derivedType.description) {
        l(`    /** ${derivedType.description} */`);
      }
      l('    @Serializable');
      l(`    @SerialName("${derivedType.tagValue}")`);
      l(`    class ${variantName}(`);
      struct.baseFields.forEach((field) => {
        l(`        /** ${field.description ?? ''} */`);
        l(`        @SerialName("${field.name}") val ${toLowerCamelCase(field.name)}: ${getKotlinTypeSpec(field)},`);
      });
      l(`        /** 数据字段 */`);
      l(`        @SerialName("data") val data: ${dataTypeName}`);
      l(`    ) : ${toUpperCamelCase(name)}()`);
      if (derivedType.derivingType === 'struct') {
        a(' {');
        l(indentLines(renderIRObject('Data', derivedType.fields, '', false), '        '));
        l('    }');
      }
      if (index !== struct.derivedTypes.length - 1) {
        l();
      }
    });
  } else {
    struct.derivedStructs.forEach((derivedStruct, index) => {
      if (derivedStruct.description) {
        l(`    /** ${derivedStruct.description} */`);
      }
      l(
        indentLines(
          renderIRObject(derivedStruct.tagValue, derivedStruct.fields, '', false, [
            `@SerialName("${derivedStruct.tagValue}")`,
          ]),
          '    '
        ) + ` : ${toUpperCamelCase(name)}()`
      );
      if (index !== struct.derivedStructs.length - 1) {
        l();
      }
    });
  }

  l('}');

  return lines.join('\n');
}

export function generateKotlinxSerializationSpec(): string {
  const lines: string[] = [];
  const ir = generateIR();
  function l(line: string = '') {
    lines.push(line);
  }
  l(`// Generated from Milky ${milkyVersion} (${milkyPackageVersion})`);
  l('@file:OptIn(ExperimentalSerializationApi::class)');
  l();
  l('package org.ntqqrev.milky');
  l();
  l('import kotlinx.serialization.Serializable');
  l('import kotlinx.serialization.*');
  l('import kotlinx.serialization.json.*');
  l();
  l(`const val milkyVersion = "${milkyVersion}"`);
  l(`const val milkyPackageVersion = "${milkyPackageVersion}"`);
  l();
  l('@Target(AnnotationTarget.PROPERTY)');
  l('annotation class LiteralDefault(val value: String)');
  l();
  l('val milkyJsonModule = Json {');
  l('    ignoreUnknownKeys = true');
  l('    explicitNulls = false');
  l('}');
  l();
  l('// ####################################');
  l('// Common Structs');
  l('// ####################################');
  l();
  ir.commonStructs.forEach((struct) => {
    if (struct.structType === 'simple') {
      l(renderIRObject(struct.name, struct.fields, struct.description));
    } else {
      l(renderIRUnionStruct(struct));
    }
    l();
  });
  l('// ####################################');
  l('// API Input and Output Structs');
  l('// ####################################');
  l();
  l('@Serializable');
  l('class ApiGeneralResponse(');
  l('    @SerialName("status") val status: String,');
  l('    @SerialName("retcode") val retcode: Int,');
  l('    @SerialName("data") val data: JsonElement? = null,');
  l('    @SerialName("message") val message: String? = null,');
  l(')');
  l();
  l('@Serializable');
  l('class ApiEmptyStruct');
  l();
  ir.apiCategories.forEach((category) => {
    l(`// ---- ${category.name} ----`);
    l();
    category.apis.forEach((api) => {
      if (api.requestFields && api.requestFields.length > 0) {
        l(renderIRObject(`${toUpperCamelCase(api.endpoint)}Input`, api.requestFields, '', false));
      } else {
        l(`typealias ${toUpperCamelCase(api.endpoint)}Input = ApiEmptyStruct`);
      }
      l();
      if (api.responseFields) {
        l(renderIRObject(`${toUpperCamelCase(api.endpoint)}Output`, api.responseFields, '', false));
      } else {
        l(`typealias ${toUpperCamelCase(api.endpoint)}Output = ApiEmptyStruct`);
      }
      l();
    });
  });
  l('// ####################################');
  l('// API Endpoint Constants');
  l('// ####################################');
  l();
  l('sealed class ApiEndpoint<T : Any, R : Any>(val path: String) {');
  ir.apiCategories.forEach((category) => {
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
