/**
 * Central Express error handler.
 * Must be registered LAST (after all routes).
 */
import type { ErrorRequestHandler } from 'express';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code ?? 'ERROR', message: err.message },
    });
    return;
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.message } });
    return;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    res.status(409).json({ error: { code: 'CONFLICT', message: 'Duplicate key error' } });
    return;
  }

  console.error('[errorHandler] Unhandled error:', err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
};
