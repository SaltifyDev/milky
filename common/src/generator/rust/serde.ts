import { IR, IRField, IRNestedUnionStruct, IRPlainUnionStruct } from '@saltify/milky-protocol';
import { collectArrayUnionRefs, collectUnionStructNames } from '../shared/ir';
import { snakeCaseToUpperCamelCase } from '../shared/naming';
import { formatDocComment } from '../shared/text';

function toSnakeCase(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toLowerCase();
}

function escapeRustString(str: string): string {
  let out = '"';
  for (const ch of str) {
    switch (ch) {
      case '\\':
        out += '\\\\';
        break;
      case '"':
        out += '\\"';
        break;
      case '\n':
        out += '\\n';
        break;
      case '\r':
        out += '\\r';
        break;
      case '\t':
        out += '\\t';
        break;
      default: {
        const codePoint = ch.codePointAt(0)!;
        if (codePoint < 0x20 || codePoint === 0x7f) {
          out += `\\u{${codePoint.toString(16)}}`;
        } else {
          out += ch;
        }
      }
    }
  }
  out += '"';
  return out;
}

function resolveDefaultValue(value: unknown): unknown {
  if (typeof value === 'function') {
    return (value as () => unknown)();
  }
  return value;
}

function formatRustLiteral(value: unknown): string {
  if (typeof value === 'string') {
    return `${escapeRustString(value)}.to_string()`;
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return `${value}`;
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (Array.isArray(value)) {
    return `vec![${value.map((item) => formatRustLiteral(item)).join(', ')}]`;
  }

  throw new Error(`Unsupported Rust default value: ${JSON.stringify(value)}`);
}

function getRustBaseType(field: IRField): string {
  if (field.fieldType === 'scalar') {
    if (field.scalarType === 'bool') {
      return 'bool';
    }
    if (field.scalarType === 'string') {
      return 'String';
    }
    if (field.scalarType === 'int64') {
      return 'i64';
    }
    return 'i32';
  }

  if (field.fieldType === 'enum') {
    return 'String';
  }

  return snakeCaseToUpperCamelCase(field.refStructName);
}

function getRustTypeSpec(field: IRField): string {
  const baseType = getRustBaseType(field);
  const typeSpec = field.isArray ? `Vec<${baseType}>` : baseType;
  if (field.isOptional && field.defaultValue === undefined) {
    return `Option<${typeSpec}>`;
  }
  return typeSpec;
}

const rustKeywords = new Set([
  'as',
  'break',
  'const',
  'continue',
  'crate',
  'else',
  'enum',
  'extern',
  'false',
  'fn',
  'for',
  'if',
  'impl',
  'in',
  'let',
  'loop',
  'match',
  'mod',
  'move',
  'mut',
  'pub',
  'ref',
  'return',
  'self',
  'Self',
  'static',
  'struct',
  'super',
  'trait',
  'true',
  'type',
  'unsafe',
  'use',
  'where',
  'while',
  'async',
  'await',
  'dyn',
  'abstract',
  'become',
  'box',
  'do',
  'final',
  'macro',
  'override',
  'priv',
  'typeof',
  'unsized',
  'virtual',
  'yield',
  'try',
]);

function toRustFieldName(name: string): string {
  return rustKeywords.has(name) ? `r#${name}` : name;
}

function getArrayUnionDeserializeFn(field: IRField, unionStructNames: Set<string>): string | null {
  if (field.fieldType !== 'ref' || !field.isArray || field.defaultValue !== undefined) {
    return null;
  }

  const fnPrefix = field.isOptional ? 'deserialize_optional_' : 'deserialize_';
  if (field.refStructName === 'IncomingSegment') {
    return `${fnPrefix}incoming_segment_list`;
  }
  if (unionStructNames.has(field.refStructName)) {
    return `${fnPrefix}drop_bad_${toSnakeCase(field.refStructName)}_list`;
  }
  return null;
}

function renderDropBadElementListHelpers(typeName: string): string[] {
  const rustTypeName = snakeCaseToUpperCamelCase(typeName);
  const snakeTypeName = toSnakeCase(typeName);
  return [
    `fn deserialize_drop_bad_${snakeTypeName}_list<'de, D>(deserializer: D) -> Result<Vec<${rustTypeName}>, D::Error>`,
    'where',
    "    D: Deserializer<'de>,",
    '{',
    `    deserialize_drop_bad_element_list::<D, ${rustTypeName}>(deserializer)`,
    '}',
    '',
    `fn deserialize_optional_drop_bad_${snakeTypeName}_list<'de, D>(deserializer: D) -> Result<Option<Vec<${rustTypeName}>>, D::Error>`,
    'where',
    "    D: Deserializer<'de>,",
    '{',
    `    deserialize_optional_drop_bad_element_list::<D, ${rustTypeName}>(deserializer)`,
    '}',
  ];
}

function renderIncomingSegmentListHelpers(): string[] {
  return [
    'fn unknown_incoming_segment(value: serde_json::Value) -> IncomingSegment {',
    '    let type_value = value',
    '        .as_object()',
    '        .and_then(|object| object.get("type"))',
    '        .and_then(serde_json::Value::as_str)',
    '        .unwrap_or("unknown");',
    '    IncomingSegment::Text(format!("[{}]", type_value))',
    '}',
    '',
    "fn deserialize_incoming_segment_list<'de, D>(deserializer: D) -> Result<Vec<IncomingSegment>, D::Error>",
    'where',
    "    D: Deserializer<'de>,",
    '{',
    '    let values = Option::<Vec<serde_json::Value>>::deserialize(deserializer)?.unwrap_or_default();',
    '    let mut out = Vec::with_capacity(values.len());',
    '    for value in values {',
    '        match serde_json::from_value::<IncomingSegment>(value.clone()) {',
    '            Ok(item) => out.push(item),',
    '            Err(_) => out.push(unknown_incoming_segment(value)),',
    '        }',
    '    }',
    '    Ok(out)',
    '}',
    '',
    "fn deserialize_optional_incoming_segment_list<'de, D>(deserializer: D) -> Result<Option<Vec<IncomingSegment>>, D::Error>",
    'where',
    "    D: Deserializer<'de>,",
    '{',
    '    let values = Option::<Vec<serde_json::Value>>::deserialize(deserializer)?;',
    '    let Some(values) = values else {',
    '        return Ok(None);',
    '    };',
    '    let mut out = Vec::with_capacity(values.len());',
    '    for value in values {',
    '        match serde_json::from_value::<IncomingSegment>(value.clone()) {',
    '            Ok(item) => out.push(item),',
    '            Err(_) => out.push(unknown_incoming_segment(value)),',
    '        }',
    '    }',
    '    Ok(Some(out))',
    '}',
  ];
}

function renderSegmentSerdeHelpers(): string[] {
  return [
    'fn serialize_segment_with_data<S, T>(serializer: S, segment_type: &str, data: &T) -> Result<S::Ok, S::Error>',
    'where',
    '    S: Serializer,',
    '    T: Serialize,',
    '{',
    '    serde_json::json!({',
    '        "type": segment_type,',
    '        "data": data,',
    '    })',
    '    .serialize(serializer)',
    '}',
    '',
    'fn serialize_segment_with_field<S, T>(',
    '    serializer: S,',
    '    segment_type: &str,',
    '    field_name: &str,',
    '    value: &T,',
    ') -> Result<S::Ok, S::Error>',
    'where',
    '    S: Serializer,',
    '    T: Serialize,',
    '{',
    '    let mut object = serde_json::Map::with_capacity(2);',
    '    object.insert("type".to_string(), serde_json::Value::String(segment_type.to_string()));',
    '    object.insert(',
    '        field_name.to_string(),',
    '        serde_json::to_value(value).map_err(serde::ser::Error::custom)?,',
    '    );',
    '    serde_json::Value::Object(object).serialize(serializer)',
    '}',
    '',
    'fn deserialize_segment_type<E>(value: &serde_json::Value) -> Result<&str, E>',
    'where',
    '    E: serde::de::Error,',
    '{',
    '    value',
    '        .get("type")',
    '        .and_then(serde_json::Value::as_str)',
    '        .ok_or_else(|| E::missing_field("type"))',
    '}',
    '',
    'fn deserialize_segment_data<E, T>(value: &serde_json::Value) -> Result<T, E>',
    'where',
    '    E: serde::de::Error,',
    '    T: DeserializeOwned,',
    '{',
    '    let data = value',
    '        .get("data")',
    '        .cloned()',
    '        .ok_or_else(|| E::missing_field("data"))?;',
    '    serde_json::from_value(data).map_err(E::custom)',
    '}',
    '',
    "fn deserialize_segment_field<E, T>(value: &serde_json::Value, field_name: &'static str) -> Result<T, E>",
    'where',
    '    E: serde::de::Error,',
    '    T: DeserializeOwned,',
    '{',
    '    let field_value = value',
    '        .get(field_name)',
    '        .cloned()',
    '        .ok_or_else(|| E::missing_field(field_name))?;',
    '    serde_json::from_value(field_value).map_err(E::custom)',
    '}',
  ];
}

function isErgonomicSegmentUnionName(name: string): boolean {
  return name === 'IncomingSegment' || name === 'OutgoingSegment';
}

function getSerdeUseLine(needsDeserializer: boolean, needsSerializer: boolean): string {
  const imports = ['Deserialize'];
  if (needsDeserializer) {
    imports.push('Deserializer');
  }
  imports.push('Serialize');
  if (needsSerializer) {
    imports.push('Serializer');
  }
  imports.push('de::DeserializeOwned');
  return `use serde::{${imports.join(', ')}};`;
}

interface RenderContext {
  defaultHelpers: string[];
  helperNames: Set<string>;
  needsDefaultDeserializer: boolean;
  unionStructNames: Set<string>;
}

function ensureDefaultHelpers(
  ctx: RenderContext,
  helperParts: string[],
  fieldType: string,
  defaultValue: unknown
): { defaultFnName: string; deserializeFnName: string } {
  const normalized = helperParts.map((part) => toSnakeCase(part)).join('_');
  const defaultFnName = `default_${normalized}`;
  const deserializeFnName = `deserialize_${normalized}`;

  if (!ctx.helperNames.has(defaultFnName)) {
    ctx.helperNames.add(defaultFnName);
    const resolvedDefaultValue = resolveDefaultValue(defaultValue);
    ctx.defaultHelpers.push(`fn ${defaultFnName}() -> ${fieldType} {`);
    ctx.defaultHelpers.push(`    ${formatRustLiteral(resolvedDefaultValue)}`);
    ctx.defaultHelpers.push('}');
    ctx.defaultHelpers.push('');
    ctx.defaultHelpers.push(`fn ${deserializeFnName}<'de, D>(deserializer: D) -> Result<${fieldType}, D::Error>`);
    ctx.defaultHelpers.push('where');
    ctx.defaultHelpers.push("    D: Deserializer<'de>,");
    ctx.defaultHelpers.push('{');
    ctx.defaultHelpers.push(`    deserialize_default_on_null(deserializer, ${defaultFnName})`);
    ctx.defaultHelpers.push('}');
  }

  ctx.needsDefaultDeserializer = true;
  return { defaultFnName, deserializeFnName };
}

function renderFieldLines(
  field: IRField,
  ctx: RenderContext,
  helperParts: string[],
  indent = '    ',
  typeOverride?: string,
  isPublic = true
): string[] {
  const lines: string[] = [];
  const rustFieldType = typeOverride ?? getRustTypeSpec(field);

  if (field.description) {
    lines.push(...formatDocComment(field.description, `${indent}/// `));
  }

  const serdeArgs = [`rename = ${escapeRustString(field.name)}`];
  const arrayUnionDeserializeFn = getArrayUnionDeserializeFn(field, ctx.unionStructNames);
  if (field.defaultValue !== undefined) {
    const { defaultFnName, deserializeFnName } = ensureDefaultHelpers(
      ctx,
      helperParts,
      rustFieldType,
      field.defaultValue
    );
    serdeArgs.push(`default = "${defaultFnName}"`, `deserialize_with = "${deserializeFnName}"`);
  } else {
    if (arrayUnionDeserializeFn) {
      serdeArgs.push(`deserialize_with = "${arrayUnionDeserializeFn}"`);
    }
    if (field.isOptional) {
      serdeArgs.push('default', 'skip_serializing_if = "Option::is_none"');
    }
  }

  lines.push(`${indent}#[serde(${serdeArgs.join(', ')})]`);
  // Enum variant fields inherit visibility from the enum, so explicit `pub` is only valid on structs.
  const visibilityPrefix = isPublic ? 'pub ' : '';
  lines.push(`${indent}${visibilityPrefix}${toRustFieldName(field.name)}: ${rustFieldType},`);

  return lines;
}

function renderIRSimpleStruct(name: string, fields: IRField[], description: string, ctx: RenderContext): string {
  const structName = snakeCaseToUpperCamelCase(name);
  const lines: string[] = [];

  if (description) {
    lines.push(...formatDocComment(description));
  }
  lines.push('#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]');

  if (fields.length === 0) {
    lines.push(`pub struct ${structName} {}`);
    return lines.join('\n');
  }

  lines.push(`pub struct ${structName} {`);
  fields.forEach((field) => {
    renderFieldLines(field, ctx, [name, field.name]).forEach((line) => lines.push(line));
  });
  lines.push('}');

  return lines.join('\n');
}

function renderEmptyApiInputStruct(name: string, description: string): string {
  const structName = snakeCaseToUpperCamelCase(name);
  const lines: string[] = [];

  if (description) {
    lines.push(...formatDocComment(description));
  }
  lines.push('#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]');
  lines.push(`pub struct ${structName} {}`);

  return lines.join('\n');
}

function renderTypeAlias(name: string, target: string, description: string): string {
  const lines: string[] = [];
  if (description) {
    lines.push(...formatDocComment(description));
  }
  lines.push(`pub type ${name} = ${target};`);
  return lines.join('\n');
}

function getNestedUnionDataTypeName(
  enumName: string,
  derivedType: IRNestedUnionStruct['derivedTypes'][number]
): string {
  return derivedType.derivingType === 'ref'
    ? snakeCaseToUpperCamelCase(derivedType.refStructName)
    : `${enumName}${snakeCaseToUpperCamelCase(derivedType.tagValue)}Data`;
}

function isCopyField(field: IRField): boolean {
  return field.fieldType === 'scalar' && field.scalarType !== 'string' && !field.isArray;
}

function renderFieldBindingExpr(field: IRField, bindingName: string): string {
  return isCopyField(field) ? `*${bindingName}` : `${bindingName}.clone()`;
}

function renderErgonomicSegmentUnion(
  struct: IRNestedUnionStruct,
  ctx: RenderContext
): { union: string; extraDefs: string[] } {
  const enumName = snakeCaseToUpperCamelCase(struct.name);
  const lines: string[] = [];
  const extraDefs: string[] = [];

  if (struct.description) {
    lines.push(...formatDocComment(struct.description));
  }
  lines.push('#[derive(Debug, Clone, PartialEq)]');
  lines.push(`pub enum ${enumName} {`);

  struct.derivedTypes.forEach((derivedType) => {
    const variantName = snakeCaseToUpperCamelCase(derivedType.tagValue);
    const dataTypeName = getNestedUnionDataTypeName(enumName, derivedType);

    if (derivedType.description) {
      lines.push(...formatDocComment(derivedType.description, '    /// '));
    }

    if (derivedType.derivingType === 'struct' && derivedType.fields.length === 0) {
      lines.push(`    ${variantName},`);
    } else if (derivedType.derivingType === 'struct' && derivedType.fields.length === 1) {
      lines.push(`    ${variantName}(${getRustTypeSpec(derivedType.fields[0])}),`);
    } else {
      lines.push(`    ${variantName}(${dataTypeName}),`);
    }
  });

  lines.push('}');
  lines.push('');
  lines.push(`impl Serialize for ${enumName} {`);
  lines.push('    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>');
  lines.push('    where');
  lines.push('        S: Serializer,');
  lines.push('    {');
  lines.push('        match self {');

  struct.derivedTypes.forEach((derivedType) => {
    const variantName = snakeCaseToUpperCamelCase(derivedType.tagValue);
    const dataTypeName = getNestedUnionDataTypeName(enumName, derivedType);

    if (derivedType.derivingType === 'struct' && derivedType.fields.length === 0) {
      lines.push(`            ${enumName}::${variantName} => {`);
      lines.push(
        `                serialize_segment_with_data(serializer, ${escapeRustString(derivedType.tagValue)}, &${dataTypeName} {})`
      );
      lines.push('            }');
      return;
    }

    if (derivedType.derivingType === 'struct' && derivedType.fields.length === 1) {
      const field = derivedType.fields[0];
      const fieldName = toRustFieldName(field.name);
      const bindingName = fieldName;
      const fieldValueExpr = renderFieldBindingExpr(field, bindingName);

      lines.push(`            ${enumName}::${variantName}(${bindingName}) => serialize_segment_with_data(`);
      lines.push('                serializer,');
      lines.push(`                ${escapeRustString(derivedType.tagValue)},`);
      lines.push(`                &${dataTypeName} { ${fieldName}: ${fieldValueExpr} },`);
      lines.push('            ),');
      return;
    }

    lines.push(
      `            ${enumName}::${variantName}(data) => serialize_segment_with_data(serializer, ${escapeRustString(derivedType.tagValue)}, data),`
    );
  });

  lines.push('        }');
  lines.push('    }');
  lines.push('}');
  lines.push('');
  lines.push(`impl<'de> Deserialize<'de> for ${enumName} {`);
  lines.push("    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>");
  lines.push('    where');
  lines.push("        D: Deserializer<'de>,");
  lines.push('    {');
  lines.push('        let value = serde_json::Value::deserialize(deserializer)?;');
  lines.push('        match deserialize_segment_type::<D::Error>(&value)? {');

  struct.derivedTypes.forEach((derivedType) => {
    const variantName = snakeCaseToUpperCamelCase(derivedType.tagValue);
    const dataTypeName = getNestedUnionDataTypeName(enumName, derivedType);

    if (derivedType.derivingType === 'struct' && derivedType.fields.length === 0) {
      lines.push(`            ${escapeRustString(derivedType.tagValue)} => {`);
      lines.push(`                let _: ${dataTypeName} = deserialize_segment_data(&value)?;`);
      lines.push(`                Ok(Self::${variantName})`);
      lines.push('            }');
      return;
    }

    if (derivedType.derivingType === 'struct' && derivedType.fields.length === 1) {
      const field = derivedType.fields[0];
      const fieldName = toRustFieldName(field.name);

      lines.push(
        `            ${escapeRustString(derivedType.tagValue)} => Ok(Self::${variantName}(deserialize_segment_data::<D::Error, ${dataTypeName}>(&value)?.${fieldName})),`
      );
      return;
    }

    lines.push(
      `            ${escapeRustString(derivedType.tagValue)} => Ok(Self::${variantName}(deserialize_segment_data(&value)?)),`
    );
  });

  lines.push('            other => Err(serde::de::Error::unknown_variant(');
  lines.push('                other,');
  lines.push('                &[');
  struct.derivedTypes.forEach((derivedType) => {
    lines.push(`                    ${escapeRustString(derivedType.tagValue)},`);
  });
  lines.push('                ],');
  lines.push('            )),');
  lines.push('        }');
  lines.push('    }');
  lines.push('}');

  struct.derivedTypes.forEach((derivedType) => {
    if (derivedType.derivingType !== 'struct') {
      return;
    }
    const dataTypeName = getNestedUnionDataTypeName(enumName, derivedType);
    const dataFieldDescription = derivedType.description ? `${derivedType.description}数据` : '数据字段';
    extraDefs.push(renderIRSimpleStruct(dataTypeName, derivedType.fields, dataFieldDescription, ctx));
  });

  return { union: lines.join('\n'), extraDefs };
}

function renderIRUnionStruct(
  struct: IRPlainUnionStruct | IRNestedUnionStruct,
  ctx: RenderContext
): { union: string; extraDefs: string[] } {
  if (struct.unionType === 'withData' && isErgonomicSegmentUnionName(struct.name)) {
    return renderErgonomicSegmentUnion(struct, ctx);
  }

  const enumName = snakeCaseToUpperCamelCase(struct.name);
  const lines: string[] = [];
  const extraDefs: string[] = [];

  if (struct.description) {
    lines.push(...formatDocComment(struct.description));
  }
  lines.push('#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]');
  lines.push(`#[serde(tag = ${escapeRustString(struct.tagFieldName)})]`);
  lines.push(`pub enum ${enumName} {`);

  if (struct.unionType === 'withData') {
    struct.derivedTypes.forEach((derivedType, index) => {
      const variantName = snakeCaseToUpperCamelCase(derivedType.tagValue);
      const dataTypeName = getNestedUnionDataTypeName(enumName, derivedType);
      const dataFieldDescription = derivedType.description ? `${derivedType.description}数据` : '数据字段';

      if (derivedType.description) {
        lines.push(...formatDocComment(derivedType.description, '    /// '));
      }
      lines.push(`    #[serde(rename = ${escapeRustString(derivedType.tagValue)})]`);
      lines.push(`    ${variantName} {`);
      struct.baseFields.forEach((field) => {
        renderFieldLines(
          field,
          ctx,
          [struct.name, derivedType.tagValue, field.name],
          '        ',
          undefined,
          false
        ).forEach((line) => lines.push(line));
      });
      renderFieldLines(
        {
          fieldType: 'ref',
          name: 'data',
          description: dataFieldDescription,
          isArray: false,
          isOptional: false,
          refStructName: dataTypeName,
        },
        ctx,
        [struct.name, derivedType.tagValue, 'data'],
        '        ',
        dataTypeName,
        false
      ).forEach((line) => lines.push(line));
      lines.push('    },');

      if (derivedType.derivingType === 'struct') {
        extraDefs.push(renderIRSimpleStruct(dataTypeName, derivedType.fields, dataFieldDescription, ctx));
      }

      if (index !== struct.derivedTypes.length - 1) {
        lines.push('');
      }
    });
  } else {
    struct.derivedStructs.forEach((derivedStruct, index) => {
      const variantName = snakeCaseToUpperCamelCase(derivedStruct.tagValue);

      if (derivedStruct.description) {
        lines.push(...formatDocComment(derivedStruct.description, '    /// '));
      }
      lines.push(`    #[serde(rename = ${escapeRustString(derivedStruct.tagValue)})]`);

      if (derivedStruct.fields.length === 0) {
        lines.push(`    ${variantName},`);
      } else {
        lines.push(`    ${variantName} {`);
        derivedStruct.fields.forEach((field) => {
          renderFieldLines(
            field,
            ctx,
            [struct.name, derivedStruct.tagValue, field.name],
            '        ',
            undefined,
            false
          ).forEach((line) => lines.push(line));
        });
        lines.push('    },');
      }

      if (index !== struct.derivedStructs.length - 1) {
        lines.push('');
      }
    });
  }

  lines.push('}');
  return { union: lines.join('\n'), extraDefs };
}

export function generateRustSerdeSpec(ir: IR): string {
  const unionStructNames = collectUnionStructNames(ir);
  const arrayUnionRefs = collectArrayUnionRefs(ir, unionStructNames);
  const hasErgonomicSegments = ir.commonStructs.some(
    (struct) => struct.structType === 'union' && struct.unionType === 'withData' && isErgonomicSegmentUnionName(struct.name)
  );
  const ctx: RenderContext = {
    defaultHelpers: [],
    helperNames: new Set<string>(),
    needsDefaultDeserializer: false,
    unionStructNames,
  };
  const lines: string[] = [];

  function l(line: string = '') {
    lines.push(line);
  }

  l(`#![allow(dead_code)]\n`);
  l(`// Generated from Milky ${ir.milkyVersion} (${ir.milkyPackageVersion})`);
  l(getSerdeUseLine(false, false));
  l();
  l(`pub const MILKY_VERSION: &str = ${escapeRustString(ir.milkyVersion)};`);
  l(`pub const MILKY_PACKAGE_VERSION: &str = ${escapeRustString(ir.milkyPackageVersion)};`);
  l();
  l('#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]');
  l(`#[serde(bound(serialize = "T: Serialize", deserialize = "T: Deserialize<'de>",))]`)
  l('pub struct ApiGeneralResponse<T> {');
  l('    #[serde(rename = "status")]');
  l('    pub status: String,');
  l('    #[serde(rename = "retcode")]');
  l('    pub retcode: i32,');
  l('    #[serde(rename = "data", default, skip_serializing_if = "Option::is_none")]');
  l('    pub data: Option<T>,');
  l('    #[serde(rename = "message", default, skip_serializing_if = "Option::is_none")]');
  l('    pub message: Option<String>,');
  l('}');
  l();
  l('#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]');
  l('pub struct ApiEmptyStruct {}');
  l('impl From<()> for ApiEmptyStruct {');
  l('    fn from(_: ()) -> Self {');
  l('        Self {}');
  l('    }');
  l('}');
  l();
  l('// ####################################');
  l('// Common Structs');
  l('// ####################################');
  l();
  ir.commonStructs.forEach((struct) => {
    if (struct.structType === 'simple') {
      l(renderIRSimpleStruct(struct.name, struct.fields, struct.description, ctx));
    } else {
      const rendered = renderIRUnionStruct(struct, ctx);
      l(rendered.union);
      if (rendered.extraDefs.length > 0) {
        l();
        rendered.extraDefs.forEach((def, index) => {
          l(def);
          if (index !== rendered.extraDefs.length - 1) {
            l();
          }
        });
      }
    }
    l();
  });
  l('// ####################################');
  l('// API Input and Output Structs');
  l('// ####################################');
  l();
  ir.apiCategories.forEach((category) => {
    l(`// ---- ${category.name} ----`);
    l();
    category.apis.forEach((api) => {
      const inputName = `${snakeCaseToUpperCamelCase(api.endpoint)}Input`;
      const inputDescription = `${api.description} API 请求参数`;
      if (api.requestFields && api.requestFields.length > 0) {
        l(renderIRSimpleStruct(inputName, api.requestFields, inputDescription, ctx));
      } else {
        l(renderEmptyApiInputStruct(inputName, inputDescription));
      }
      l();

      const outputName = `${snakeCaseToUpperCamelCase(api.endpoint)}Output`;
      const outputDescription = `${api.description} API 响应数据`;
      if (api.responseFields && api.responseFields.length > 0) {
        l(renderIRSimpleStruct(outputName, api.responseFields, outputDescription, ctx));
      } else {
        l(renderTypeAlias(outputName, 'ApiEmptyStruct', outputDescription));
      }
      l();
    });
  });

  lines[2] = getSerdeUseLine(ctx.needsDefaultDeserializer || arrayUnionRefs.size > 0 || hasErgonomicSegments, hasErgonomicSegments);

  if (ctx.needsDefaultDeserializer || arrayUnionRefs.size > 0 || hasErgonomicSegments) {
    const importLineIndex = lines.findIndex((line) => line.startsWith('use serde::{'));
    lines[importLineIndex] = getSerdeUseLine(
      ctx.needsDefaultDeserializer || arrayUnionRefs.size > 0 || hasErgonomicSegments,
      hasErgonomicSegments
    );
    l('// ####################################');
    l('// Serde Helpers');
    l('// ####################################');
    l();
    if (hasErgonomicSegments) {
      renderSegmentSerdeHelpers().forEach((line) => l(line));
      l();
    }
    if (arrayUnionRefs.size > 0) {
      l("fn deserialize_drop_bad_element_list<'de, D, T>(deserializer: D) -> Result<Vec<T>, D::Error>");
      l('where');
      l("    D: Deserializer<'de>,");
      l('    T: serde::de::DeserializeOwned,');
      l('{');
      l('    let values = Option::<Vec<serde_json::Value>>::deserialize(deserializer)?.unwrap_or_default();');
      l('    let mut out = Vec::with_capacity(values.len());');
      l('    for value in values {');
      l('        if let Ok(item) = serde_json::from_value::<T>(value) {');
      l('            out.push(item);');
      l('        }');
      l('    }');
      l('    Ok(out)');
      l('}');
      l();
      l(
        "fn deserialize_optional_drop_bad_element_list<'de, D, T>(deserializer: D) -> Result<Option<Vec<T>>, D::Error>"
      );
      l('where');
      l("    D: Deserializer<'de>,");
      l('    T: serde::de::DeserializeOwned,');
      l('{');
      l('    let values = Option::<Vec<serde_json::Value>>::deserialize(deserializer)?;');
      l('    let Some(values) = values else {');
      l('        return Ok(None);');
      l('    };');
      l('    let mut out = Vec::with_capacity(values.len());');
      l('    for value in values {');
      l('        if let Ok(item) = serde_json::from_value::<T>(value) {');
      l('            out.push(item);');
      l('        }');
      l('    }');
      l('    Ok(Some(out))');
      l('}');
      l();

      if (arrayUnionRefs.has('IncomingSegment')) {
        renderIncomingSegmentListHelpers().forEach((line) => l(line));
        l();
      }

      Array.from(arrayUnionRefs)
        .filter((name) => name !== 'IncomingSegment')
        .forEach((name) => {
          renderDropBadElementListHelpers(name).forEach((line) => l(line));
          l();
        });
    }

    if (ctx.needsDefaultDeserializer) {
      l("fn deserialize_default_on_null<'de, D, T, F>(deserializer: D, default: F) -> Result<T, D::Error>");
      l('where');
      l("    D: Deserializer<'de>,");
      l("    T: Deserialize<'de>,");
      l('    F: FnOnce() -> T,');
      l('{');
      l('    Ok(Option::<T>::deserialize(deserializer)?.unwrap_or_else(default))');
      l('}');
      l();
    }

    ctx.defaultHelpers.forEach((line) => l(line));
    if (ctx.defaultHelpers.length > 0 && ctx.defaultHelpers[ctx.defaultHelpers.length - 1] !== '') {
      l();
    }
  }

  l('// ####################################');
  l('// API Endpoint Constants');
  l('// ####################################');
  l();
  l('pub trait ApiEndpoint: Serialize {');
  l('    type Output: DeserializeOwned;');
  l("    const NAME: &'static str;");
  l('}');
  l();
  ir.apiCategories.forEach((category) => {
    category.apis.forEach((api) => {
      const endpointName = `${snakeCaseToUpperCamelCase(api.endpoint)}Input`;
      l(`/// ${api.description}`);
      l(`impl ApiEndpoint for ${endpointName} {`);
      l(`    type Output = ${snakeCaseToUpperCamelCase(api.endpoint)}Output;`);
      l(`    const NAME: &'static str = ${escapeRustString(`${api.endpoint}`)};`);
      l('}');
      l();
    });
  });

  return lines.join('\n');
}
