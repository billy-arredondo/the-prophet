/**
 * Basic smoke test — verifies the Express app boots and /health responds.
 * Uses supertest (in-process, no real DB needed).
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';

describe('App smoke tests', () => {
  const app = createApp();

  it('GET /health returns 200 and { status: "ok" }', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });

  it('GET /docs returns 200 (swagger UI)', async () => {
    const res = await request(app).get('/docs/');
    // Swagger UI serves HTML; just check it doesn't 404
    expect(res.status).toBeLessThan(400);
  });

  it('GET /unknown-route returns 404', async () => {
    const res = await request(app).get('/not-a-real-route');
    expect(res.status).toBe(404);
  });
});
