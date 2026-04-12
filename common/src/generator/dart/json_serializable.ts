import { IR, IRField, IRNestedUnionStruct, IRPlainUnionStruct } from '@saltify/milky-protocol';
import { collectArrayUnionRefs, collectUnionStructNames } from '../shared/ir';
import { snakeCaseToLowerCamelCase, snakeCaseToUpperCamelCase } from '../shared/naming';
import { formatDocComment } from '../shared/text';

function formatDartLiteral(value: unknown): string {
  return JSON.stringify(value);
}

function resolveDefaultValue(value: unknown): unknown {
  if (typeof value === 'function') {
    return (value as () => unknown)();
  }
  return value;
}

function renderDropBadElementListHelper(typeName: string): string {
  const className = snakeCaseToUpperCamelCase(typeName);
  return [
    `List<${className}> _dropBad${className}ListFromJson(Object? json) {`,
    `  if (json == null) {`,
    `    return const <${className}>[];`,
    `  }`,
    `  if (json is! List) {`,
    `    throw FormatException('Expected a list for ${className}');`,
    `  }`,
    `  final List<${className}> output = [];`,
    `  for (final element in json) {`,
    `    try {`,
    `      if (element is Map<String, dynamic>) {`,
    `        output.add(${className}.fromJson(element));`,
    `      } else if (element is Map) {`,
    `        output.add(${className}.fromJson(Map<String, dynamic>.from(element)));`,
    `      }`,
    `    } catch (_) {`,
    `      // Skip invalid or unknown variants.`,
    `    }`,
    `  }`,
    `  return output;`,
    `}`,
  ].join('\n');
}

function renderIncomingSegmentListHelper(): string {
  return [
    'IncomingSegment _unknownIncomingSegment(Object? element) {',
    "  var typeValue = 'unknown';",
    '  if (element is Map) {',
    "    final rawType = element['type'];",
    '    if (rawType != null) {',
    '      typeValue = rawType.toString();',
    '    }',
    '  }',
    '  return IncomingSegment.text(',
    '    data: IncomingSegmentTextData(',
    "      text: '[${typeValue}]',",
    '    ),',
    '  );',
    '}',
    '',
    'List<IncomingSegment> _incomingSegmentListFromJson(Object? json) {',
    '  if (json == null) {',
    '    return const <IncomingSegment>[];',
    '  }',
    '  if (json is! List) {',
    "    throw FormatException('Expected a list for IncomingSegment');",
    '  }',
    '  final List<IncomingSegment> output = [];',
    '  for (final element in json) {',
    '    try {',
    '      if (element is Map<String, dynamic>) {',
    '        output.add(IncomingSegment.fromJson(element));',
    '      } else if (element is Map) {',
    '        output.add(IncomingSegment.fromJson(Map<String, dynamic>.from(element)));',
    '      }',
    '    } catch (_) {',
    '      output.add(_unknownIncomingSegment(element));',
    '    }',
    '  }',
    '  return output;',
    '}',
  ].join('\n');
}

function getDartTypeSpec(field: IRField): string {
  let baseType: string;
  if (field.fieldType === 'scalar') {
    if (field.scalarType === 'bool') {
      baseType = 'bool';
    } else if (field.scalarType === 'string') {
      baseType = 'String';
    } else {
      baseType = 'int';
    }
  } else if (field.fieldType === 'enum') {
    baseType = 'String';
  } else {
    baseType = snakeCaseToUpperCamelCase(field.refStructName);
  }

  return field.isArray ? `List<${baseType}>` : baseType;
}

function renderFieldLines(key: string, field: IRField, unionStructNames: Set<string>, typeOverride?: string): string[] {
  const lines: string[] = [];
  const fieldName = snakeCaseToLowerCamelCase(key);
  const description = field.description;
  const baseType = typeOverride ?? getDartTypeSpec(field);
  const hasDefault = field.defaultValue !== undefined;
  const isNullable = field.isOptional && !hasDefault;
  const dartType = isNullable ? `${baseType}?` : baseType;
  const isRequired = !isNullable && !hasDefault;
  const jsonKeyParts = [`name: "${key}"`];

  if (field.fieldType === 'ref' && field.isArray) {
    if (field.refStructName === 'IncomingSegment') {
      jsonKeyParts.push('fromJson: _incomingSegmentListFromJson');
    } else if (unionStructNames.has(field.refStructName)) {
      jsonKeyParts.push(`fromJson: _dropBad${snakeCaseToUpperCamelCase(field.refStructName)}ListFromJson`);
    }
  }

  formatDocComment(description, '/// ', field.since).forEach((line) => lines.push(line));
  if (hasDefault) {
    lines.push(`@Default(${formatDartLiteral(resolveDefaultValue(field.defaultValue))})`);
  }
  lines.push(`@JsonKey(${jsonKeyParts.join(', ')})`);
  lines.push(`${isRequired ? 'required ' : ''}${dartType} ${fieldName},`);

  return lines;
}

function renderIRSimpleStruct(
  name: string,
  fields: IRField[],
  description: string,
  unionStructNames: Set<string>,
  since?: string
): string {
  const className = snakeCaseToUpperCamelCase(name);
  const entries = fields;
  const lines: string[] = [];

  lines.push(...formatDocComment(description, '/// ', since));
  lines.push('@freezed');
  lines.push(`abstract class ${className} with _$${className} {`);
  if (entries.length === 0) {
    lines.push(`  const factory ${className}() = _${className};`);
  } else {
    lines.push(`  const factory ${className}({`);
    entries.forEach((field) => {
      renderFieldLines(field.name, field, unionStructNames).forEach((line) => {
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

function renderTypeAlias(name: string, target: string, description: string, since?: string): string {
  const lines: string[] = [];

  lines.push(...formatDocComment(description, '/// ', since));
  lines.push(`typedef ${name} = ${target};`);

  return lines.join('\n');
}

function renderIRUnionStruct(
  struct: IRPlainUnionStruct | IRNestedUnionStruct,
  unionStructNames: Set<string>
): { union: string; extraDefs: string[] } {
  const name = struct.name;
  const className = snakeCaseToUpperCamelCase(name);
  const lines: string[] = [];
  const extraDefs: string[] = [];
  const discriminator = struct.tagFieldName;

  lines.push(...formatDocComment(struct.description, '/// ', struct.since));
  lines.push(`@Freezed(unionKey: "${discriminator}")`);
  lines.push(`abstract class ${className} with _$${className} {`);

  if (struct.unionType === 'withData') {
    struct.derivedTypes.forEach((derivedType, index) => {
      const variantValue = derivedType.tagValue;
      const variantConstructor = snakeCaseToLowerCamelCase(variantValue);
      const variantClassName = `${className}${snakeCaseToUpperCamelCase(variantValue)}`;
      let dataTypeName: string;

      if (derivedType.derivingType === 'ref') {
        dataTypeName = snakeCaseToUpperCamelCase(derivedType.refStructName);
      } else {
        dataTypeName = `${className}${snakeCaseToUpperCamelCase(variantValue)}Data`;
        extraDefs.push(renderIRSimpleStruct(dataTypeName, derivedType.fields, derivedType.description, unionStructNames, derivedType.since));
      }

      lines.push(...formatDocComment(derivedType.description, '  /// ', derivedType.since));
      lines.push(`  @FreezedUnionValue("${variantValue}")`);
      lines.push(`  const factory ${className}.${variantConstructor}({`);
      struct.baseFields.forEach((field) => {
        renderFieldLines(field.name, field, unionStructNames).forEach((line) => {
          lines.push(`    ${line}`);
        });
      });
      const dataField: IRField = {
        fieldType: 'ref',
        name: 'data',
        description: '',
        isArray: false,
        isOptional: false,
        refStructName: dataTypeName,
      };
      renderFieldLines('data', dataField, unionStructNames, dataTypeName).forEach((line) => {
        lines.push(`    ${line}`);
      });
      lines.push(`  }) = ${variantClassName};`);
      if (index !== struct.derivedTypes.length - 1) {
        lines.push('');
      }
    });
  } else {
    struct.derivedStructs.forEach((derivedStruct, index) => {
      const variantValue = derivedStruct.tagValue;
      const variantConstructor = snakeCaseToLowerCamelCase(variantValue);
      const variantClassName = `${className}${snakeCaseToUpperCamelCase(variantValue)}`;

      lines.push(...formatDocComment(derivedStruct.description, '  /// ', derivedStruct.since));
      lines.push(`  @FreezedUnionValue("${variantValue}")`);
      lines.push(`  const factory ${className}.${variantConstructor}({`);
      derivedStruct.fields.forEach((field) => {
        renderFieldLines(field.name, field, unionStructNames).forEach((line) => {
          lines.push(`    ${line}`);
        });
      });
      lines.push(`  }) = ${variantClassName};`);
      if (index !== struct.derivedStructs.length - 1) {
        lines.push('');
      }
    });
  }

  lines.push('');
  lines.push(`  factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);`);
  lines.push('}');

  return { union: lines.join('\n'), extraDefs };
}

export function generateDartJsonSerializableSpec(ir: IR): string {
  const lines: string[] = [];
  const unionStructNames = collectUnionStructNames(ir);
  const arrayUnionRefs = collectArrayUnionRefs(ir);
  function l(line: string = '') {
    lines.push(line);
  }

  l('// ignore_for_file: invalid_annotation_target');
  l(`// Generated from Milky ${ir.milkyVersion} (${ir.milkyPackageVersion})`);
  l();
  l("import 'package:freezed_annotation/freezed_annotation.dart';");
  l();
  l("part 'milky_types.freezed.dart';");
  l("part 'milky_types.g.dart';");
  l();
  l(`const milkyVersion = "${ir.milkyVersion}";`);
  l(`const milkyPackageVersion = "${ir.milkyPackageVersion}";`);
  l();
  if (arrayUnionRefs.has('IncomingSegment')) {
    l(renderIncomingSegmentListHelper());
    l();
  }
  Array.from(arrayUnionRefs)
    .filter((name) => name !== 'IncomingSegment')
    .forEach((name) => {
      l(renderDropBadElementListHelper(name));
      l();
    });
  l('@freezed');
  l('abstract class ApiGeneralResponse with _$ApiGeneralResponse {');
  l('  const factory ApiGeneralResponse({');
  l('    @JsonKey(name: "status") required String status,');
  l('    @JsonKey(name: "retcode") required int retcode,');
  l('    @JsonKey(name: "data") Object? data,');
  l('    @JsonKey(name: "message") String? message,');
  l('  }) = _ApiGeneralResponse;');
  l();
  l('  factory ApiGeneralResponse.fromJson(Map<String, dynamic> json) => _$ApiGeneralResponseFromJson(json);');
  l('}');
  l();
  l('@freezed');
  l('abstract class ApiEmptyStruct with _$ApiEmptyStruct {');
  l('  const factory ApiEmptyStruct() = _ApiEmptyStruct;');
  l();
  l('  factory ApiEmptyStruct.fromJson(Map<String, dynamic> json) => _$ApiEmptyStructFromJson(json);');
  l('}');
  l();
  l('// ####################################');
  l('// Common Structs');
  l('// ####################################');
  l();
  ir.commonStructs.forEach((struct) => {
    if (struct.structType === 'simple') {
      l(renderIRSimpleStruct(struct.name, struct.fields, struct.description, unionStructNames, struct.since));
    } else {
      const rendered = renderIRUnionStruct(struct, unionStructNames);
      l(rendered.union);
      if (rendered.extraDefs.length > 0) {
        l();
        rendered.extraDefs.forEach((def) => {
          l(def);
          l();
        });
      } else {
        l();
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
      if (api.requestFields && api.requestFields.length > 0) {
        l(renderIRSimpleStruct(inputName, api.requestFields, `${api.description} API 请求参数`, unionStructNames, api.since));
      } else {
        l(renderTypeAlias(inputName, 'ApiEmptyStruct', `${api.description} API 请求参数`, api.since));
      }
      l();
      const outputName = `${snakeCaseToUpperCamelCase(api.endpoint)}Output`;
      if (api.responseFields && api.responseFields.length > 0) {
        l(renderIRSimpleStruct(outputName, api.responseFields, `${api.description} API 响应数据`, unionStructNames, api.since));
      } else if (api.responseFields) {
        l(renderTypeAlias(outputName, 'ApiEmptyStruct', `${api.description} API 响应数据`, api.since));
      } else {
        l(renderTypeAlias(outputName, 'ApiEmptyStruct', `${api.description} API 响应数据`, api.since));
      }
      l();
    });
  });
  l('// ####################################');
  l('// API Endpoint Constants');
  l('// ####################################');
  l();
  l('class ApiEndpoint<T, R> {');
  l('  final String endpoint;');
  l('  final T Function(Map<String, dynamic>) fromJsonInput;');
  l('  final Map<String, dynamic> Function(R) toJsonOutput;');
  l();
  l('  const ApiEndpoint(this.endpoint, this.fromJsonInput, this.toJsonOutput);');
  l();
  ir.apiCategories.forEach((category) => {
    category.apis.forEach((api) => {
      formatDocComment(api.description, '  /// ', api.since).forEach((line) => l(line));
      l(`  static final ${snakeCaseToLowerCamelCase(api.endpoint)} = ApiEndpoint(`);
      l(`    "/${api.endpoint}",`);
      l(`    ${snakeCaseToUpperCamelCase(api.endpoint)}Input.fromJson,`);
      l(`    (${snakeCaseToUpperCamelCase(api.endpoint)}Output output) => output.toJson(),`);
      l('  );');
    });
  });
  l('}');
  l();

  return lines.join('\n');
}
