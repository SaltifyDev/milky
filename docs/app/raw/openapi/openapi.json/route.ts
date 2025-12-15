import { milkyPackageVersion, milkyVersion } from '@saltify/milky-types';
import { apiCategories, commonStructs } from '@/app/common';
import { z } from 'zod';

export const dynamic = 'force-static';

function sanitizeSchema(schema: Record<string, unknown>) {
  const { $schema, ...rest } = schema;
  return rest;
}

function getSchemaId(registry: typeof z.globalRegistry, schema: z.ZodTypeAny) {
  const meta = registry.get(schema);
  return meta && typeof meta === 'object' ? (meta as Record<string, string>).id : undefined;
}

function buildComponents(registry: typeof z.globalRegistry) {
  const jsonSchemas = z.toJSONSchema(registry, {
    metadata: registry,
    io: 'input',
    target: 'openapi-3.0',
    uri: (id) => `#/components/schemas/${id}`,
  }).schemas;

  const schemas = Object.fromEntries(
    Object.entries(jsonSchemas ?? {}).map(([name, schema]) => [name, sanitizeSchema(schema as Record<string, unknown>)])
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

function buildPaths(registry: typeof z.globalRegistry) {
  const paths: Record<string, unknown> = {};

  Object.values(apiCategories).forEach((category) => {
    category.apis.forEach((api) => {
      const requestId = getSchemaId(registry, api.inputStruct) ?? 'ApiEmptyObject';
      const responseId = api.outputStruct instanceof z.ZodVoid ? undefined : getSchemaId(registry, api.outputStruct);
      const dataSchema = responseId
        ? { $ref: `#/components/schemas/${responseId}` }
        : { $ref: '#/components/schemas/ApiEmptyObject' };

      paths[`/api/${api.endpoint}`] = {
        post: {
          tags: [category.name],
          summary: api.description,
          operationId: api.endpoint,
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${requestId}` },
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
                          data: dataSchema,
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

function buildWebhooks(registry: typeof z.globalRegistry) {
  const eventSchemaId = getSchemaId(registry, commonStructs.Event as z.ZodTypeAny);
  const schema = eventSchemaId
    ? { $ref: `#/components/schemas/${eventSchemaId}` }
    : { $ref: '#/components/schemas/ApiEmptyObject' };

  return {
    event: {
      post: {
        summary: '事件推送 WebHook',
        description: '协议端向 WebHook 地址推送的事件，遵循 Event 结构定义。',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema,
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

export function GET() {
  const schemas = buildComponents(z.globalRegistry);

  return new Response(
    JSON.stringify({
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
        schemas,
      },
      paths: buildPaths(z.globalRegistry),
      webhooks: buildWebhooks(z.globalRegistry),
    })
  );
}
