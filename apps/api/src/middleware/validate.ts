/**
 * Zod body-validation middleware factory.
 *
 * Usage:
 *   router.post('/groups', validate(createGroupSchema), controller)
 *
 * On failure returns 400 with structured Zod errors.
 * On success the parsed+coerced data replaces req.body.
 */
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

export function validate<T>(schema: ZodSchema<T>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: result.error.flatten().fieldErrors,
        },
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
