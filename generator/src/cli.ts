#!/usr/bin/env node

import * as c from '@saltify/milky-common';
import ir, { IR } from '@saltify/milky-protocol';
import { command, run, string, positional, option, subcommands } from 'cmd-ts';

type GeneratorSpec = {
  canonicalName: string;
  generate: (ir: IR) => string | object | Promise<string | object>;
};

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

async function resolveProtocolOfVersion(version: string): Promise<IR> {
  if (version === 'latest') {
    return await fetch('https://cdn.jsdelivr.net/npm/@saltify/milky-protocol/dist/protocol.json').then((res) =>
      res.json()
    );
  } else if (version === 'local') {
    return ir;
  } else {
    const response = await fetch(`https://cdn.jsdelivr.net/npm/@saltify/milky-protocol@${version}/dist/protocol.json`);
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
  cmds: {
    generate: command({
      name: 'generate',
      args: {
        generator: positional({
          type: string,
          description: 'The canonical name of the generator to run. Use "list" to see all available generators.',
        }),
        output: option({
          type: string,
          long: 'output',
          short: 'o',
          description: 'The output file path. If not specified, the generated spec will be printed to stdout.',
          defaultValue: () => '',
        }),
        version: option({
          type: string,
          long: 'version',
          short: 'v',
          description:
            'The version of the Milky IR to use. ' +
            'If not specified, the latest version (the version published with `latest` tag on npm) will be used.',
          defaultValue: () => 'latest',
        }),
      },
      handler: async (args) => {
        const spec = generators.find((gen) => gen.canonicalName === args.generator);
        if (!spec) {
          console.error(`Unknown generator: ${args.generator}`);
          console.error('Use "milkygen list" to see all available generators.');
          process.exit(1);
        }
        const protocol = await resolveProtocolOfVersion(args.version);
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
  },
});

run(cmd, process.argv.slice(2));
