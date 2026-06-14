/**
 * requireAuth middleware.
 * Verifies the Better Auth session and attaches req.user (our User document).
 * Rejects with 401 if no valid session is found.
 * Rejects with 503 if the DB is not connected (auth can't work without it).
 */
import type { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { getAuth } from '../lib/auth.js';
import { getNativeDb } from '../lib/db.js';
import UserModel from '../modules/users/users.model.js';
import { env } from '../config/env.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!getNativeDb()) {
    res.status(503).json({ error: { code: 'DB_UNAVAILABLE', message: 'Database not connected' } });
    return;
  }

  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });

    if (!session?.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    // Attach raw session for downstream use
    req.session = session as Request['session'];

    // Look up (or auto-create on first login) our user document
    let user = await UserModel.findOne({ _id: session.user.id }).lean(false);

    if (!user) {
      // First login via Better Auth — create mirror document
      const isSuperAdmin = session.user.email
        ? env.SUPER_ADMIN_EMAILS.includes(session.user.email)
        : false;

      user = await UserModel.create({
        _id: session.user.id,
        displayName: session.user.name ?? 'User',
        email: session.user.email ?? null,
        photoURL: session.user.image ?? null,
        provider: session.user.email ? 'google' : 'guest',
        managedBy: null,
        isSuperAdmin,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[requireAuth]', err);
    res.status(500).json({ error: { code: 'AUTH_ERROR', message: 'Authentication check failed' } });
  }
}
