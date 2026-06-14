/**
 * OpenAPI / Swagger documentation.
 * Registers the shared Zod schemas and generates an OpenAPI 3.0 spec,
 * served via swagger-ui-express at /docs.
 */
import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  createGroupSchema,
  createManagedMemberSchema,
  confirmResultSchema,
  joinGroupSchema,
  overrideResultSchema,
  upsertPredictionSchema,
  updateGroupSchema,
  updateProfileSchema,
} from '@the-prophet/shared';

// Extend Zod with .openapi() method
extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

// ── Security scheme (components are registered, not passed to generateDocument) ──
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

// ── Register shared schemas ───────────────────────────────────────────────────
registry.register('UpdateProfile', updateProfileSchema);
registry.register('CreateManagedMember', createManagedMemberSchema);
registry.register('CreateGroup', createGroupSchema);
registry.register('UpdateGroup', updateGroupSchema);
registry.register('JoinGroup', joinGroupSchema);
registry.register('UpsertPrediction', upsertPredictionSchema);
registry.register('ConfirmResult', confirmResultSchema);
registry.register('OverrideResult', overrideResultSchema);

// ── Basic route registrations (summary only — flesh out as routes solidify) ──
registry.registerPath({
  method: 'get',
  path: '/api/health',
  summary: 'Health check',
  responses: { 200: { description: 'OK' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/me',
  summary: 'Get current user profile',
  security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'User profile' }, 401: { description: 'Unauthorized' } },
});

registry.registerPath({
  method: 'patch',
  path: '/api/me',
  summary: 'Update current user profile',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: updateProfileSchema } } } },
  responses: { 200: { description: 'Updated profile' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/groups',
  summary: 'Create a prediction group',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: createGroupSchema } } } },
  responses: { 201: { description: 'Created group' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/groups/join',
  summary: 'Join a group via invite code',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: joinGroupSchema } } } },
  responses: { 200: { description: 'Joined group' } },
});

registry.registerPath({
  method: 'put',
  path: '/api/matches/{id}/prediction',
  summary: 'Create or update a prediction for a match',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: upsertPredictionSchema } } } },
  responses: { 200: { description: 'Upserted prediction' } },
});

registry.registerPath({
  method: 'post',
  path: '/api/matches/{id}/confirm-result',
  summary: '(Super-admin) Confirm an official match result and trigger scoring',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: confirmResultSchema } } } },
  responses: { 200: { description: 'Result confirmed and scoring triggered' } },
});

export function buildOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'The Prophet API',
      version: '1.0.0',
      description: 'Private World Cup predictions game — REST API',
    },
    servers: [{ url: 'http://localhost:4000', description: 'Local dev' }],
  });
}
