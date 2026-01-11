import { generateIR, IRField, IRStruct } from '@/app/ir';
import { milkyVersion, milkyPackageVersion } from '@saltify/milky-types';

export const dynamic = 'force-static';

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

function resolveDefaultValue(value: unknown): unknown {
  if (typeof value === 'function') {
    return (value as () => unknown)();
  }
  return value;
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
    baseType = toUpperCamelCase(field.refStructName);
  }

  return field.isArray ? `List<${baseType}>` : baseType;
}

function renderFieldLines(key: string, field: IRField, typeOverride?: string): string[] {
  const lines: string[] = [];
  const fieldName = toLowerCamelCase(key);
  const description = field.description;
  const baseType = typeOverride ?? getDartTypeSpec(field);
  const hasDefault = field.defaultValue !== undefined;
  const isNullable = field.isOptional && !hasDefault;
  const dartType = isNullable ? `${baseType}?` : baseType;
  const isRequired = !isNullable && !hasDefault;

  if (description) {
    formatDocComment(description).forEach((line) => lines.push(line));
  }
  if (hasDefault) {
    lines.push(`@Default(${formatDartLiteral(resolveDefaultValue(field.defaultValue))})`);
  }
  lines.push(`@JsonKey(name: "${key}")`);
  lines.push(`${isRequired ? 'required ' : ''}${dartType} ${fieldName},`);

  return lines;
}

function renderIRSimpleStruct(name: string, fields: IRField[], description: string): string {
  const className = toUpperCamelCase(name);
  const entries = fields;
  const lines: string[] = [];

  lines.push('@freezed');
  lines.push(`abstract class ${className} with _$${className} {`);
  if (entries.length === 0) {
    lines.push(`  const factory ${className}() = _${className};`);
  } else {
    lines.push(`  const factory ${className}({`);
    entries.forEach((field) => {
      renderFieldLines(field.name, field).forEach((line) => {
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

function renderIRUnionStruct(struct: IRStruct): { union: string; extraDefs: string[] } {
  if (struct.structType !== 'union') {
    throw new Error('Expected union struct');
  }

  const name = struct.name;
  const className = toUpperCamelCase(name);
  const lines: string[] = [];
  const extraDefs: string[] = [];
  const discriminator = struct.tagFieldName;

  lines.push(`@Freezed(unionKey: "${discriminator}")`);
  lines.push(`abstract class ${className} with _$${className} {`);

  if (struct.unionType === 'withData') {
    struct.derivedTypes.forEach((derivedType, index) => {
      const variantValue = derivedType.tagValue;
      const variantConstructor = toLowerCamelCase(variantValue);
      const variantClassName = `${className}${toUpperCamelCase(variantValue)}`;
      let dataTypeName: string;

      if (derivedType.derivingType === 'ref') {
        dataTypeName = toUpperCamelCase(derivedType.refStructName);
      } else {
        dataTypeName = `${className}${toUpperCamelCase(variantValue)}Data`;
        extraDefs.push(renderIRSimpleStruct(dataTypeName, derivedType.fields, ''));
      }

      lines.push(`  @FreezedUnionValue("${variantValue}")`);
      lines.push(`  const factory ${className}.${variantConstructor}({`);
      struct.baseFields.forEach((field) => {
        renderFieldLines(field.name, field).forEach((line) => {
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
      renderFieldLines('data', dataField, dataTypeName).forEach((line) => {
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
      const variantConstructor = toLowerCamelCase(variantValue);
      const variantClassName = `${className}${toUpperCamelCase(variantValue)}`;

      lines.push(`  @FreezedUnionValue("${variantValue}")`);
      lines.push(`  const factory ${className}.${variantConstructor}({`);
      derivedStruct.fields.forEach((field) => {
        renderFieldLines(field.name, field).forEach((line) => {
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

function generateDartSpec(): string {
  const lines: string[] = [];
  const ir = generateIR();
  function l(line: string = '') {
    lines.push(line);
  }

  l('// ignore_for_file: invalid_annotation_target');
  l(`// Generated from Milky ${milkyVersion} (${milkyPackageVersion})`);
  l();
  l("import 'package:freezed_annotation/freezed_annotation.dart';");
  l();
  l("part 'milky_types.freezed.dart';");
  l("part 'milky_types.g.dart';");
  l();
  l(`const milkyVersion = "${milkyVersion}";`);
  l(`const milkyPackageVersion = "${milkyPackageVersion}";`);
  l();
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
      l(renderIRSimpleStruct(struct.name, struct.fields, struct.description));
    } else {
      const rendered = renderIRUnionStruct(struct);
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
      const inputName = `${toUpperCamelCase(api.endpoint)}Input`;
      if (api.requestFields && api.requestFields.length > 0) {
        l(renderIRSimpleStruct(inputName, api.requestFields, ''));
      } else {
        l(`typedef ${inputName} = ApiEmptyStruct;`);
      }
      l();
      const outputName = `${toUpperCamelCase(api.endpoint)}Output`;
      if (api.responseFields && api.responseFields.length > 0) {
        l(renderIRSimpleStruct(outputName, api.responseFields, ''));
      } else if (api.responseFields) {
        l(`typedef ${outputName} = ApiEmptyStruct;`);
      } else {
        l(`typedef ${outputName} = ApiEmptyStruct;`);
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
      l(`  /// ${api.description}`);
      l(`  static final ${toLowerCamelCase(api.endpoint)} = ApiEndpoint(`);
      l(`    "/${api.endpoint}",`);
      l(`    ${toUpperCamelCase(api.endpoint)}Input.fromJson,`);
      l(`    (${toUpperCamelCase(api.endpoint)}Output output) => output.toJson(),`);
      l('  );');
    });
  });
  l('}');
  l();

  return lines.join('\n');
}

export function GET() {
  return new Response(generateDartSpec());
}
