#!/usr/bin/env node

import * as c from '@saltify/milky-common';
import ir, { IR } from '@saltify/milky-protocol';
import { command, run, string, positional, option, subcommands } from 'cmd-ts';
import pkg from '../package.json';

interface GeneratorSpec {
  canonicalName: string;
  generate: (ir: IR) => string | object | Promise<string | object>;
}

interface CDNSpec {
  name: string;
  generateUrl: (packageName: string, version: string) => string;
}

const generators: GeneratorSpec[] = [
  {
    canonicalName: 'dart/json-serializable',
    generate: c.generateDartJsonSerializableSpec,
  },
  {
    canonicalName: 'json-schema',
    generate: c.generateJsonSchema,
  },
  {
    canonicalName: 'kotlin/kotlinx-serialization',
    generate: c.generateKotlinxSerializationSpec,
  },
  {
    canonicalName: 'markdown/roadmap',
    generate: c.generateMarkdownRoadmap,
  },
  {
    canonicalName: 'openapi',
    generate: c.generateOpenApiSpec,
  },
  {
    canonicalName: 'rust/serde',
    generate: c.generateRustSerdeSpec,
  },
  {
    canonicalName: 'typescript/static',
    generate: c.generateTypeScriptStaticSpec,
  },
  {
    canonicalName: 'typescript/zod',
    generate: c.generateTypeScriptZodSpec,
  },
];

const cdns: CDNSpec[] = [
  {
    name: 'unpkg',
    generateUrl: (packageName, version) => `https://unpkg.com/${packageName}@${version}/dist/protocol.json`,
  },
  {
    name: 'esmsh',
    generateUrl: (packageName, version) => `https://esm.sh/${packageName}@${version}/dist/protocol.json`,
  },
  {
    name: 'jsdelivr',
    generateUrl: (packageName, version) => `https://cdn.jsdelivr.net/npm/${packageName}@${version}/dist/protocol.json`,
  },
];

async function resolveProtocolOfVersion(version: string, cdn: CDNSpec): Promise<IR> {
  if (version === 'local') {
    return ir;
  } else {
    const response = await fetch(cdn.generateUrl('@saltify/milky-protocol', version));
    if (!response.ok) {
      throw new Error(`Failed to fetch protocol of version ${version}: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }
}

function serializeOutput(output: string | object): string {
  if (typeof output === 'string') {
    return output;
  } else {
    return JSON.stringify(output, null, 2);
  }
}

const cmd = subcommands({
  name: 'milkygen',
  description: pkg.description,
  cmds: {
    generate: command({
      name: 'generate',
      description: 'Generate a spec from Milky IR.',
      args: {
        generator: positional({
          displayName: 'generator',
          type: string,
          description: 'Name of the generator to run. Use "list" for all available generators.',
        }),
        output: option({
          type: string,
          long: 'output',
          short: 'o',
          description: 'The output file path. The generator writes to stdout if not provided.',
          defaultValue: () => '',
        }),
        version: option({
          type: string,
          long: 'version',
          short: 'v',
          description: 'The version of the Milky IR to use. Latest stable version if not specified.',
          defaultValue: () => 'latest',
        }),
        cdn: option({
          type: string,
          long: 'cdn',
          description: `The CDN to fetch the protocol definition from. "${cdns[0].name}" if not specified.`,
          defaultValue: () => cdns[0].name,
        }),
      },
      handler: async (args) => {
        const spec = generators.find((gen) => gen.canonicalName === args.generator);
        if (!spec) {
          console.error(`Unknown generator: ${args.generator}`);
          console.error('Use "milkygen list" to see all available generators.');
          process.exit(1);
        }
        const cdnSpec = cdns.find((c) => c.name === args.cdn);
        if (!cdnSpec) {
          console.error(`Unknown CDN: ${args.cdn}`);
          console.error(`Use "milkygen list-cdns" to see all supported CDNs.`);
          process.exit(1);
        }
        const protocol = await resolveProtocolOfVersion(args.version, cdnSpec);
        const content = serializeOutput(await spec.generate(protocol));
        if (args.output.length === 0) {
          process.stdout.write(content);
          process.exit(0);
        } else {
          const fs = await import('fs/promises');
          const path = await import('path');
          const resolvedOutputFile = path.resolve(process.cwd(), args.output);
          await fs.mkdir(path.dirname(resolvedOutputFile), { recursive: true });
          await fs.writeFile(resolvedOutputFile, content);
          console.log(`Generated ${spec.canonicalName} -> ${resolvedOutputFile}`);
        }
      },
    }),
    list: command({
      name: 'list',
      description: 'List all available generators.',
      args: {},
      handler: () => {
        console.log('Available generators:');
        generators.forEach((gen) => {
          console.log(`  - ${gen.canonicalName}`);
        });
      },
    }),
    'list-cdns': command({
      name: 'list-cdns',
      description: 'List all supported CDNs to fetch protocol definitions from.',
      args: {},
      handler: () => {
        console.log('Supported CDNs:');
        cdns.forEach((cdn) => {
          console.log(`  - ${cdn.name}`);
        });
      },
    }),
    version: command({
      name: 'version',
      description: 'Print the version of milkygen.',
      args: {},
      handler: () => {
        console.log(pkg.version);
      },
    }),
  },
});

run(cmd, process.argv.slice(2));
