import { IR, IRField, IRNestedUnionStruct, IRPlainUnionStruct } from '@common/ir/types';
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
    baseType = toUpperCamelCase(field.refStructName);
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

function isSameField(f1: IRField, f2: IRField): boolean {
  if (f1.name !== f2.name) return false;
  if (f1.fieldType !== f2.fieldType) return false;
  if (f1.isArray !== f2.isArray) return false;
  if (f1.isOptional !== f2.isOptional) return false;

  if (f1.fieldType === 'scalar' && f2.fieldType === 'scalar') {
    return f1.scalarType === f2.scalarType;
  }
  if (f1.fieldType === 'ref' && f2.fieldType === 'ref') {
    return f1.refStructName === f2.refStructName;
  }
  return true;
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
  includeDesc = true,
  additionalAnnotations: string[] = [],
  overrideFields: Set<string> = new Set()
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
  if (fields.length > 0) {
    l(`data class ${toUpperCamelCase(name)}(`);
    fields.forEach((field) => {
      const needsOverride = overrideFields.has(field.name);
      const defaultValue = field.defaultValue !== undefined ? JSON.stringify(field.defaultValue) : null;
      const overridePrefix = needsOverride ? 'override ' : '';

      l(`    /** ${field.description ?? ''} */`);

      renderFieldAnnotations(ir, field, l);

      l(
        `    @SerialName("${field.name}")${
          defaultValue ? ` @LiteralDefault("${escapeString(defaultValue)}")` : ''
        } ${overridePrefix}val ${toLowerCamelCase(field.name)}: ${getKotlinTypeSpec(field, needsOverride)},`
      );
    });
    l(')');
  } else {
    l(`class ${toUpperCamelCase(name)}`);
  }
  return lines.join('\n');
}

function renderIRUnionStruct(ir: IR, struct: IRPlainUnionStruct | IRNestedUnionStruct) {
  const {name} = struct;
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

  let commonFields: IRField[] = [];

  if (struct.unionType === 'withData') {
    commonFields = struct.baseFields || [];
  } else if (struct.derivedStructs.length > 0) {
    commonFields = [...struct.derivedStructs[0].fields];
    for (let i = 1; i < struct.derivedStructs.length; i++) {
      const currentStructFields = struct.derivedStructs[i].fields;
      commonFields = commonFields.filter((f1) => currentStructFields.some((f2) => isSameField(f1, f2)));
    }
  }

  const commonFieldNames = new Set<string>();

  if (commonFields.length > 0) {
    commonFields.forEach((field) => {
      commonFieldNames.add(field.name);
      l(`    /** ${field.description ?? ''} */`);
      l(`    abstract val ${toLowerCamelCase(field.name)}: ${getKotlinTypeSpec(field, true)}`);
    });
    l();
  }

  if (struct.unionType === 'withData') {
    struct.derivedTypes.forEach((derivedType, index) => {
      const variantName = toUpperCamelCase(derivedType.tagValue);
      const dataTypeName = derivedType.derivingType === 'ref' ? toUpperCamelCase(derivedType.refStructName) : 'Data';
      if (derivedType.description) {
        l(`    /** ${derivedType.description} */`);
      }
      l('    @Serializable');
      l(`    @SerialName("${derivedType.tagValue}")`);
      l(`    data class ${variantName}(`);
      struct.baseFields.forEach((field) => {
        l(`        /** ${field.description ?? ''} */`);

        renderFieldAnnotations(ir, field, l);

        l(
          `        @SerialName("${field.name}") override val ${toLowerCamelCase(field.name)}: ${getKotlinTypeSpec(field, true)},`
        );
      });
      l(`        /** 数据字段 */`);
      l(`        @SerialName("data") val data: ${dataTypeName}`);
      l(`    ) : ${toUpperCamelCase(name)}()`);
      if (derivedType.derivingType === 'struct') {
        a(' {');
        l(indentLines(renderIRObject(ir, 'Data', derivedType.fields, '', false), '        '));
        l();
        derivedType.fields.forEach(field => {
          const fieldName = toLowerCamelCase(field.name);
          const fieldType = getKotlinTypeSpec(field, true);
          l(`        /**`);
          l(`         * 访问器字段，对应 \`data\` 中的同名字段`);
          l(`         * @see [Data.${fieldName}]`);
          l(`         */`);
          l(`        val ${fieldName}: ${fieldType} get() = data.${fieldName}`);
        });
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
          renderIRObject(
            ir,
            derivedStruct.tagValue,
            derivedStruct.fields,
            '',
            false,
            [`@SerialName("${derivedStruct.tagValue}")`],
            commonFieldNames
          ),
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
  l('import kotlinx.serialization.*');
  l('import kotlinx.serialization.builtins.*');
  l('import kotlinx.serialization.descriptors.*');
  l('import kotlinx.serialization.encoding.*');
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
  l(
    `
internal class DropBadElementListSerializer<T>(private val elementSerializer: KSerializer<T>) : KSerializer<List<T>> {
    val listSerializer = ListSerializer(elementSerializer)

    override val descriptor: SerialDescriptor =
        listSerializer.descriptor

    override fun serialize(encoder: Encoder, value: List<T>) {
        encoder.encodeSerializableValue(listSerializer, value)
    }

    override fun deserialize(decoder: Decoder): List<T> {
        if (decoder !is JsonDecoder) {
            throw SerializationException("This serializer can be used only with Json format")
        }

        val element = decoder.decodeJsonElement() as? JsonArray
            ?: throw SerializationException("Expected JsonArray for List deserialization")

        val out = ArrayList<T>(element.size)
        for (e in element) {
            try {
                out += decoder.json.decodeFromJsonElement(elementSerializer, e)
            } catch (_: SerializationException) {
                // discard bad element quietly
            }
        }
        return out
    }
}
    `.trim()
  );
  l();
  l(
    `
internal class TransformUnknownSegmentListSerializer(private val elementSerializer: KSerializer<IncomingSegment>) :
    KSerializer<List<IncomingSegment>> {

    val listSerializer = ListSerializer(elementSerializer)

    override val descriptor: SerialDescriptor =
        listSerializer.descriptor

    override fun serialize(encoder: Encoder, value: List<IncomingSegment>) {
        encoder.encodeSerializableValue(listSerializer, value)
    }

    override fun deserialize(decoder: Decoder): List<IncomingSegment> {
        if (decoder !is JsonDecoder) {
            throw SerializationException("This serializer can be used only with Json format")
        }

        val element = decoder.decodeJsonElement() as? JsonArray
            ?: throw SerializationException("Expected JsonArray for List deserialization")

        val out = ArrayList<IncomingSegment>(element.size)
        for (e in element) {
            out += try {
                decoder.json.decodeFromJsonElement(elementSerializer, e)
            } catch (_: SerializationException) {
                IncomingSegment.Text(
                    data = IncomingSegment.Text.Data(
                        text = "[\${e.jsonObject["type"]!!.jsonPrimitive.content}]"
                    )
                )
            }
        }
        return out
    }
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
      l(renderIRObject(ir, struct.name, struct.fields, struct.description));
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
        l(renderIRObject(ir, `${toUpperCamelCase(api.endpoint)}Input`, api.requestFields, '', false));
      } else {
        l(`typealias ${toUpperCamelCase(api.endpoint)}Input = ApiEmptyStruct`);
      }
      l();
      if (api.responseFields) {
        l(renderIRObject(ir, `${toUpperCamelCase(api.endpoint)}Output`, api.responseFields, '', false));
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
