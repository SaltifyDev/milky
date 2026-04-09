import { IR } from '@saltify/milky-protocol';
import { z } from 'zod';
import { generateTypeScriptZodSpec } from '../typescript/zod';
import { importCodeAsModule, initRegistry } from '../common';
import { transform } from 'sucrase';

const preserveFullCapitalizedWords = ['csrf'];

function snakeCaseToPascalCase(snakeCase: string): string {
  return snakeCase
    .split('_')
    .map((part) =>
      preserveFullCapitalizedWords.includes(part) ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join('');
}

function sanitizeSchema(schema: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { $schema, ...rest } = schema;
  return rest;
}

function buildComponents() {
  const jsonSchemas = z.toJSONSchema(z.globalRegistry, {
    metadata: z.globalRegistry,
    io: 'input',
    target: 'openapi-3.0',
    uri: (id) => `#/components/schemas/${id}`,
  }).schemas;

  const schemas = Object.fromEntries(
    Object.entries(jsonSchemas ?? {}).map(([name, schema]) => [name, sanitizeSchema(schema)])
  );

  schemas.ApiResponse = {
    type: 'object',
    required: ['status', 'retcode'],
    properties: {
      status: {
        type: 'string',
        enum: ['ok', 'failed'],
      },
      retcode: {
        type: 'integer',
        description: '业务状态码，0 表示成功',
      },
      data: {},
      message: {
        type: 'string',
        nullable: true,
        description: '错误消息，仅失败时返回',
      },
    },
  };

  schemas.ApiEmptyObject = {
    type: 'object',
    additionalProperties: false,
    description: '空对象，用于无输入/输出的 API',
  };

  return schemas;
}

function buildPaths(ir: IR) {
  const paths: Record<string, unknown> = {};

  ir.apiCategories.forEach((category) => {
    category.apis.forEach((spec) => {
      const requestIdOrNull = spec.requestFields && `${snakeCaseToPascalCase(spec.endpoint)}Input`;
      const responseIdOrNull = spec.responseFields && `${snakeCaseToPascalCase(spec.endpoint)}Output`;

      paths[`/api/${spec.endpoint}`] = {
        post: {
          tags: [category.name],
          summary: spec.description,
          operationId: spec.endpoint,
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: requestIdOrNull
                    ? `#/components/schemas/${requestIdOrNull}`
                    : '#/components/schemas/ApiEmptyObject',
                },
              },
            },
          },
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/ApiResponse' },
                      {
                        properties: {
                          data: {
                            $ref: responseIdOrNull
                              ? `#/components/schemas/${responseIdOrNull}`
                              : '#/components/schemas/ApiEmptyObject',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            '401': { description: '鉴权失败，未携带或提供了错误的 access_token' },
            '404': { description: '请求的 API 不存在' },
            '415': { description: 'Content-Type 非 application/json' },
          },
        },
      };
    });
  });

  return paths;
}

function buildWebhooks() {
  return {
    event: {
      post: {
        summary: '事件推送 WebHook',
        description: '协议端向 WebHook 地址推送的事件，遵循 Event 结构定义。',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Event' },
            },
          },
        },
        responses: {
          '200': { description: '已成功接收事件' },
        },
      },
    },
  };
}

async function initTypesModule(ir: IR) {
  const tsCode = generateTypeScriptZodSpec(ir);
  const { code } = transform(tsCode, {
    transforms: ['typescript'],
  });
  const codeWithCorrectImport = code.replace(
    '\'zod\'',
    `'${import.meta.resolve('zod')}'`
  );
  return await importCodeAsModule(codeWithCorrectImport);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateOpenApiSpec(ir: IR, typesModule?: any) {
  initRegistry(ir, typesModule ?? (await initTypesModule(ir)));

  return {
    openapi: '3.1.0',
    info: {
      title: 'Milky',
      version: ir.milkyPackageVersion,
      description: `Milky 协议 API 与事件定义（v${ir.milkyVersion}）`,
    },
    servers: [
      {
        url: '/',
        description: '协议端 API 根路径',
      },
    ],
    security: [{ BearerAuth: [] }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'Token',
          description: '在 Authorization 头中携带：Bearer {access_token}',
        },
      },
      schemas: buildComponents(),
    },
    paths: buildPaths(ir),
    webhooks: buildWebhooks(),
  };
}
