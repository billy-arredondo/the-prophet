/**
 * Express application factory.
 * Wires middleware, auth handler, routers, and error handler.
 * Exported separately from server.ts so it can be imported in tests.
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { toNodeHandler } from 'better-auth/node';

import { env } from './config/env.js';
import { getAuth } from './lib/auth.js';
import { buildOpenApiDocument } from './lib/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';

import usersRouter from './modules/users/users.routes.js';
import groupsRouter from './modules/groups/groups.routes.js';
import tournamentsRouter from './modules/tournaments/tournaments.routes.js';
import matchesRouter from './modules/matches/matches.routes.js';
import predictionsRouter from './modules/predictions/predictions.routes.js';
import resultsRouter from './modules/results/results.routes.js';
import rankingsRouter from './modules/rankings/rankings.routes.js';

export function createApp() {
  const app = express();

  // ── Security ───────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true,
    }),
  );

  // ── Body parsing ───────────────────────────────────────────────────────────
  app.use(express.json({ limit: '256kb' }));

  // ── Rate limiting (applied only to sensitive routes) ──────────────────────
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' } },
  });

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });

  // ── Health check (no auth required) ───────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: env.NODE_ENV });
  });

  // ── Better Auth handler ────────────────────────────────────────────────────
  // Must use app.all() (not app.use()) so Express does NOT strip the /api/auth
  // prefix from req.url — Better Auth needs the full path to match its routes.
  app.all('/api/auth/*', authLimiter, (req, res) => {
    try {
      return toNodeHandler(getAuth())(req, res);
    } catch {
      res.status(503).json({ error: { code: 'AUTH_UNAVAILABLE', message: 'Auth service not ready' } });
    }
  });

  // ── API routers ────────────────────────────────────────────────────────────
  app.use('/api', apiLimiter, usersRouter);
  app.use('/api', apiLimiter, groupsRouter);
  app.use('/api', apiLimiter, tournamentsRouter);
  app.use('/api', apiLimiter, matchesRouter);
  app.use('/api', apiLimiter, predictionsRouter);
  app.use('/api', apiLimiter, resultsRouter);
  app.use('/api', apiLimiter, rankingsRouter);

  // ── Swagger UI ─────────────────────────────────────────────────────────────
  try {
    const openApiDoc = buildOpenApiDocument();
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));
    app.get('/docs.json', (_req, res) => res.json(openApiDoc));
  } catch (err) {
    console.warn('[swagger] Failed to build OpenAPI doc:', err);
  }

  // ── 404 for unmatched routes ───────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  // ── Global error handler (must be last) ───────────────────────────────────
  app.use(errorHandler);

  return app;
}
