/**
 * requireGoogleAuth middleware.
 * Must run AFTER requireAuth.
 * Rejects guest/anonymous users — only Google-authenticated users may proceed.
 * Used on group creation and admin-level mutations.
 */
import type { Request, Response, NextFunction } from 'express';

export function requireGoogleAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }

  if (req.user.provider !== 'google') {
    res.status(403).json({
      error: {
        code: 'GOOGLE_AUTH_REQUIRED',
        message: 'This action requires a Google-authenticated account',
      },
    });
    return;
  }

  next();
}
