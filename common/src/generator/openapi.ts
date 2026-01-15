import { apiSpecCategories } from '@saltify/milky-types/namings';
import z from 'zod';
import { milkyPackageVersion, milkyVersion } from '@saltify/milky-types';

function sanitizeSchema(schema: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { $schema, ...rest } = schema;
  return rest;
}

function buildComponents(registry: typeof z.globalRegistry) {
  const jsonSchemas = z.toJSONSchema(registry, {
    metadata: registry,
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

function buildPaths() {
  const paths: Record<string, unknown> = {};

  apiSpecCategories.forEach((category) => {
    category.apiSpecs.forEach((spec) => {
      const requestIdOrNull = spec.inputStructName && `Api_${spec.endpoint}_input`;
      const responseIdOrNull = spec.outputStructName && `Api_${spec.endpoint}_output`;

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

export function generateOpenApiSpec() {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Milky',
      version: milkyPackageVersion,
      description: `Milky 协议 API 与事件定义（v${milkyVersion}）`,
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
      schemas: buildComponents(z.globalRegistry),
    },
    paths: buildPaths(),
    webhooks: buildWebhooks(),
  };
}
