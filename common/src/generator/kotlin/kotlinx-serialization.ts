import type { IR, IRField, IRNestedUnionStruct, IRPlainUnionStruct } from '@saltify/milky-protocol';

import { getPlainUnionCommonFields } from '../shared/ir';
import { snakeCaseToLowerCamelCase, snakeCaseToUpperCamelCase } from '../shared/naming';
import { formatBlockDocComment, indentLines } from '../shared/text';

function escapeString(str: string): string {
  return str.replace(/"/g, '\\"');
}

function getKotlinTypeSpec(field: IRField, skipDefaultValue: boolean = false): string {
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
    baseType = snakeCaseToUpperCamelCase(field.refStructName);
  }

  const typeSpec = field.isArray ? `List<${baseType}>` : baseType;
  if (skipDefaultValue) {
    return field.isOptional ? `${typeSpec}?` : typeSpec;
  }
  if (field.defaultValue !== undefined) {
    return `${typeSpec} = ${JSON.stringify(field.defaultValue)}`;
  }
  if (field.isOptional) {
    return `${typeSpec}? = null`;
  }
  return typeSpec;
}

function renderFieldAnnotations(ir: IR, field: IRField, l: (line: string) => void) {
  if (field.fieldType === 'ref' && field.isArray) {
    if (field.refStructName === 'IncomingSegment') {
      l('    @Serializable(with = TransformUnknownSegmentListSerializer::class)');
    } else if (ir.commonStructs.find((s) => s.name === field.refStructName)?.structType === 'union') {
      l('    @Serializable(with = DropBadElementListSerializer::class)');
    }
  }
}

function renderIRObject(
  ir: IR,
  name: string,
  fields: IRField[],
  description: string,
  since?: string,
  includeDesc = true,
  additionalAnnotations: string[] = [],
  overrideFields: Set<string> = new Set(),
): string {
  const lines: string[] = [];
  function l(line: string = '') {
    lines.push(line);
  }
  if (includeDesc) {
    formatBlockDocComment(description, since).forEach((line) => {
      l(line);
    });
  }
  l('@Serializable');
  additionalAnnotations.forEach((annotation) => {
    l(annotation);
  });
  if (fields.length > 0) {
    l(`data class ${snakeCaseToUpperCamelCase(name)}(`);
    fields.forEach((field) => {
      const needsOverride = overrideFields.has(field.name);
      const defaultValue = field.defaultValue !== undefined ? JSON.stringify(field.defaultValue) : null;
      const overridePrefix = needsOverride ? 'override ' : '';

      formatBlockDocComment(field.description, field.since, '    ').forEach((line) => {
        l(line);
      });

      renderFieldAnnotations(ir, field, l);

      l(
        `    @SerialName("${field.name}")${
          defaultValue ? ` @LiteralDefault("${escapeString(defaultValue)}")` : ''
        } ${overridePrefix}val ${snakeCaseToLowerCamelCase(field.name)}: ${getKotlinTypeSpec(field, needsOverride)},`,
      );
    });
    l(')');
  } else {
    l(`class ${snakeCaseToUpperCamelCase(name)}`);
  }
  return lines.join('\n');
}

function renderTypeAlias(name: string, target: string, description: string, since?: string): string {
  const lines: string[] = [];

  formatBlockDocComment(description, since).forEach((line) => {
    lines.push(line);
  });
  lines.push(`typealias ${name} = ${target}`);

  return lines.join('\n');
}

function renderIRUnionStruct(ir: IR, struct: IRPlainUnionStruct | IRNestedUnionStruct) {
  const { name } = struct;
  const lines: string[] = [];
  function l(line: string = '') {
    lines.push(line);
  }
  function a(line: string = '') {
    lines[lines.length - 1] += line;
  }

  formatBlockDocComment(struct.description, struct.since).forEach((line) => {
    l(line);
  });
  l('@Serializable');

  l(`@JsonClassDiscriminator("${struct.tagFieldName}")`);
  l(`sealed class ${snakeCaseToUpperCamelCase(name)} {`);

  let commonFields: IRField[] = [];

  if (struct.unionType === 'withData') {
    commonFields = struct.baseFields || [];
  } else {
    commonFields = getPlainUnionCommonFields(struct);
  }

  const commonFieldNames = new Set<string>();

  if (commonFields.length > 0) {
    commonFields.forEach((field) => {
      commonFieldNames.add(field.name);
      formatBlockDocComment(field.description, field.since, '    ').forEach((line) => {
        l(line);
      });
      l(`    abstract val ${snakeCaseToLowerCamelCase(field.name)}: ${getKotlinTypeSpec(field, true)}`);
    });
    l();
  }

  if (struct.unionType === 'withData') {
    struct.derivedTypes.forEach((derivedType, index) => {
      const variantName = snakeCaseToUpperCamelCase(derivedType.tagValue);
      const dataTypeName =
        derivedType.derivingType === 'ref' ? snakeCaseToUpperCamelCase(derivedType.refStructName) : 'Data';
      formatBlockDocComment(derivedType.description, derivedType.since, '    ').forEach((line) => {
        l(line);
      });
      l('    @Serializable');
      l(`    @SerialName("${derivedType.tagValue}")`);
      l(`    data class ${variantName}(`);
      struct.baseFields.forEach((field) => {
        formatBlockDocComment(field.description, field.since, '        ').forEach((line) => {
          l(line);
        });

        renderFieldAnnotations(ir, field, l);

        l(
          `        @SerialName("${field.name}") override val ${snakeCaseToLowerCamelCase(field.name)}: ${getKotlinTypeSpec(field, true)},`,
        );
      });
      l(`        /** 数据字段 */`);
      l(`        @SerialName("data") val data: ${dataTypeName}`);
      l(`    ) : ${snakeCaseToUpperCamelCase(name)}()`);

      const isStruct = derivedType.derivingType === 'struct';
      const isRef = derivedType.derivingType === 'ref';

      let targetFields: IRField[] = [];
      let targetName = 'Data';

      if (isStruct) {
        targetFields = derivedType.fields;
      } else if (isRef) {
        targetName = snakeCaseToUpperCamelCase(derivedType.refStructName);
        const refStruct = ir.commonStructs.find((s) => s.name === derivedType.refStructName);

        if (refStruct) {
          if (refStruct.structType === 'simple') {
            targetFields = refStruct.fields;
          } else if (refStruct.structType === 'union') {
            if (refStruct.unionType === 'withData') {
              targetFields = refStruct.baseFields || [];
            } else {
              targetFields = getPlainUnionCommonFields(refStruct);
            }
          }
        }
      }

      if (isStruct || targetFields.length > 0) {
        a(' {');
        if (isStruct) {
          l(
            indentLines(
              renderIRObject(ir, 'Data', derivedType.fields, derivedType.description, derivedType.since),
              '        ',
            ),
          );
          l();
        }

        targetFields.forEach((field: IRField) => {
          const realFieldName = snakeCaseToLowerCamelCase(field.name);
          let fieldName = realFieldName;
          const fieldType = getKotlinTypeSpec(field, true);

          if (commonFieldNames.has(field.name)) {
            fieldName = `data${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`;
          }

          l(`        /**`);
          l(`         * 访问器字段，对应 \`data\` 中的同名字段`);
          l(`         * @see [${targetName}.${realFieldName}]`);
          l(`         */`);
          l(`        val ${fieldName}: ${fieldType} get() = data.${realFieldName}`);
        });
        l('    }');
      }

      if (index !== struct.derivedTypes.length - 1) {
        l();
      }
    });
  } else {
    struct.derivedStructs.forEach((derivedStruct, index) => {
      formatBlockDocComment(derivedStruct.description, derivedStruct.since, '    ').forEach((line) => {
        l(line);
      });
      l(
        `${indentLines(
          renderIRObject(
            ir,
            derivedStruct.tagValue,
            derivedStruct.fields,
            '',
            undefined,
            false,
            [`@SerialName("${derivedStruct.tagValue}")`],
            commonFieldNames,
          ),
          '    ',
        )} : ${snakeCaseToUpperCamelCase(name)}()`,
      );
      if (index !== struct.derivedStructs.length - 1) {
        l();
      }
    });
  }

  l('}');

  return lines.join('\n');
}

export function generateKotlinxSerializationSpec(ir: IR): string {
  const lines: string[] = [];
  function l(line: string = '') {
    lines.push(line);
  }
  l(`// Generated from Milky ${ir.milkyVersion} (${ir.milkyPackageVersion})`);
  l('@file:OptIn(ExperimentalSerializationApi::class)');
  l();
  l('package org.ntqqrev.milky');
  l();
  l('import kotlinx.serialization.*');
  l('import kotlinx.serialization.builtins.*');
  l('import kotlinx.serialization.descriptors.*');
  l('import kotlinx.serialization.encoding.*');
  l('import kotlinx.serialization.json.*');
  l();
  l(`const val milkyVersion = "${ir.milkyVersion}"`);
  l(`const val milkyPackageVersion = "${ir.milkyPackageVersion}"`);
  l();
  l('@Target(AnnotationTarget.PROPERTY)');
  l('annotation class LiteralDefault(val value: String)');
  l();
  l('val milkyJsonModule = Json {');
  l('    ignoreUnknownKeys = true');
  l('    explicitNulls = false');
  l('}');
  l();
  l(
    'internal class DropBadElementListSerializer<T>(private val elementSerializer: KSerializer<T>) : KSerializer<List<T>> {',
  );
  l('    val listSerializer = ListSerializer(elementSerializer)');
  l();
  l('    override val descriptor: SerialDescriptor =');
  l('        listSerializer.descriptor');
  l();
  l('    override fun serialize(encoder: Encoder, value: List<T>) {');
  l('        encoder.encodeSerializableValue(listSerializer, value)');
  l('    }');
  l();
  l('    override fun deserialize(decoder: Decoder): List<T> {');
  l('        if (decoder !is JsonDecoder) {');
  l('            throw SerializationException("This serializer can be used only with Json format")');
  l('        }');
  l();
  l('        val element = decoder.decodeJsonElement() as? JsonArray');
  l('            ?: throw SerializationException("Expected JsonArray for List deserialization")');
  l();
  l('        val out = ArrayList<T>(element.size)');
  l('        for (e in element) {');
  l('            try {');
  l('                out += decoder.json.decodeFromJsonElement(elementSerializer, e)');
  l('            } catch (_: SerializationException) {');
  l('                // discard bad element quietly');
  l('            }');
  l('        }');
  l('        return out');
  l('    }');
  l('}');
  l();
  l(
    'internal class TransformUnknownSegmentListSerializer(private val elementSerializer: KSerializer<IncomingSegment>) :',
  );
  l('    KSerializer<List<IncomingSegment>> {');
  l();
  l('    val listSerializer = ListSerializer(elementSerializer)');
  l();
  l('    override val descriptor: SerialDescriptor =');
  l('        listSerializer.descriptor');
  l();
  l('    override fun serialize(encoder: Encoder, value: List<IncomingSegment>) {');
  l('        encoder.encodeSerializableValue(listSerializer, value)');
  l('    }');
  l();
  l('    override fun deserialize(decoder: Decoder): List<IncomingSegment> {');
  l('        if (decoder !is JsonDecoder) {');
  l('            throw SerializationException("This serializer can be used only with Json format")');
  l('        }');
  l();
  l('        val element = decoder.decodeJsonElement() as? JsonArray');
  l('            ?: throw SerializationException("Expected JsonArray for List deserialization")');
  l();
  l('        val out = ArrayList<IncomingSegment>(element.size)');
  l('        for (e in element) {');
  l('            out += try {');
  l('                decoder.json.decodeFromJsonElement(elementSerializer, e)');
  l('            } catch (_: SerializationException) {');
  l('                IncomingSegment.Text(');
  l('                    data = IncomingSegment.Text.Data(');
  l('                        text = "[${e.jsonObject["type"]!!.jsonPrimitive.content}]"');
  l('                    )');
  l('                )');
  l('            }');
  l('        }');
  l('        return out');
  l('    }');
  l('}');
  l();
  l('// ####################################');
  l('// Common Structs');
  l('// ####################################');
  l();
  ir.commonStructs.forEach((struct) => {
    if (struct.structType === 'simple') {
      l(renderIRObject(ir, struct.name, struct.fields, struct.description, struct.since));
    } else {
      l(renderIRUnionStruct(ir, struct));
    }
    l();
  });
  l('// ####################################');
  l('// API Input and Output Structs');
  l('// ####################################');
  l();
  l('@Serializable');
  l('data class ApiGeneralResponse(');
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
        l(
          renderIRObject(
            ir,
            `${snakeCaseToUpperCamelCase(api.endpoint)}Input`,
            api.requestFields,
            `${api.description} API 请求参数`,
            api.since,
          ),
        );
      } else {
        l(
          renderTypeAlias(
            `${snakeCaseToUpperCamelCase(api.endpoint)}Input`,
            'ApiEmptyStruct',
            `${api.description} API 请求参数`,
            api.since,
          ),
        );
      }
      l();
      if (api.responseFields) {
        l(
          renderIRObject(
            ir,
            `${snakeCaseToUpperCamelCase(api.endpoint)}Output`,
            api.responseFields,
            `${api.description} API 响应数据`,
            api.since,
          ),
        );
      } else {
        l(
          renderTypeAlias(
            `${snakeCaseToUpperCamelCase(api.endpoint)}Output`,
            'ApiEmptyStruct',
            `${api.description} API 响应数据`,
            api.since,
          ),
        );
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
      formatBlockDocComment(api.description, api.since, '    ').forEach((line) => {
        l(line);
      });
      l(
        `    object ${snakeCaseToUpperCamelCase(api.endpoint)} : ApiEndpoint<${snakeCaseToUpperCamelCase(
          api.endpoint,
        )}Input, ${snakeCaseToUpperCamelCase(api.endpoint)}Output>("/${api.endpoint}")`,
      );
    });
  });
  l('}');

  return lines.join('\n');
}
