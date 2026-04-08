#!/usr/bin/env -S node --import tsx

import fs from 'node:fs';
import path from 'node:path';

import { generateDartJsonSerializableSpec } from './generator/dart/json_serializable';
import { generateJsonSchema } from './generator/json-schema';
import { generateKotlinxSerializationSpec } from './generator/kotlin/kotlinx-serialization';
import { generateMarkdownRoadmap } from './generator/markdown/roadmap';
import { generateOpenApiSpec } from './generator/openapi';
import { generateRustSerdeSpec } from './generator/rust/serde';
import { generateTypeScriptZodSpec } from './generator/typescript/zod';

type GeneratorOutput = string | object;

type GeneratorSpec = {
  canonicalName: string;
  generate: () => GeneratorOutput;
};

const generatorSpecs: GeneratorSpec[] = [
  {
    canonicalName: 'json-schema',
    generate: generateJsonSchema,
  },
  {
    canonicalName: 'openapi',
    generate: generateOpenApiSpec,
  },
  {
    canonicalName: 'kotlin/kotlinx-serialization',
    generate: generateKotlinxSerializationSpec,
  },
  {
    canonicalName: 'rust/serde',
    generate: generateRustSerdeSpec,
  },
  {
    canonicalName: 'typescript/zod',
    generate: generateTypeScriptZodSpec,
  },
  {
    canonicalName: 'dart/json-serializable',
    generate: generateDartJsonSerializableSpec,
  },
  {
    canonicalName: 'markdown/roadmap',
    generate: generateMarkdownRoadmap,
  },
];

function usage() {
  const supported = generatorSpecs.map((spec) => `  - ${spec.canonicalName}`).join('\n');
  return [
    'Usage:',
    '  milky-common generate <generator> <output-file>',
    '',
    'Examples:',
    '  milky-common generate kotlin/kotlinx-serialization ./Types.kt',
    '  milky-common generate openapi ./openapi.json',
    '',
    'Supported generators:',
    supported,
  ].join('\n');
}

function serializeOutput(output: GeneratorOutput): string {
  if (typeof output === 'string') {
    return output;
  }
  return `${JSON.stringify(output, null, 2)}\n`;
}

const [, , command, generatorName, outputFile, ...rest] = process.argv;

if (command === 'help' || command === '--help' || command === '-h') {
  console.log(usage());
  process.exit(0);
}

if (command !== 'generate' || !generatorName || !outputFile || rest.length > 0) {
  console.error(usage());
  process.exit(1);
}

const spec = generatorSpecs.find((spec) => spec.canonicalName === generatorName);
if (!spec) {
  console.error(`Unknown generator: ${generatorName}`);
  console.error();
  console.error(usage());
  process.exit(1);
}

const content = serializeOutput(spec.generate());
if (outputFile === '-') {
  process.stdout.write(content);
  process.exit(0);
}

const resolvedOutputFile = path.resolve(process.cwd(), outputFile);
fs.mkdirSync(path.dirname(resolvedOutputFile), { recursive: true });
fs.writeFileSync(resolvedOutputFile, content);
console.log(`Generated ${spec.canonicalName} -> ${resolvedOutputFile}`);
