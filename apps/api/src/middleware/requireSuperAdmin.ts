/**
 * requireSuperAdmin middleware.
 * Must run AFTER requireAuth.
 * Only platform super-admins may access result-confirmation endpoints.
 */
import type { Request, Response, NextFunction } from 'express';

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }

  if (!req.user.isSuperAdmin) {
    res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Super-admin privileges required' },
    });
    return;
  }

  next();
}
