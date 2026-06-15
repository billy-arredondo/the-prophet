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
import { readDeviceCookie, verifyDeviceToken } from '../lib/deviceToken.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!getNativeDb()) {
    res.status(503).json({ error: { code: 'DB_UNAVAILABLE', message: 'Database not connected' } });
    return;
  }

  try {
    // Managed members (minors) authenticate with a device-token cookie, not a
    // Better Auth session. Check that first; fall through to Better Auth if absent/invalid.
    const deviceToken = readDeviceCookie(req.headers.cookie);
    if (deviceToken) {
      const decoded = verifyDeviceToken(deviceToken);
      if (decoded) {
        const member = await UserModel.findById(decoded.memberId);
        if (member && member.provider === 'guest' && member.managedBy) {
          req.user = member;
          next();
          return;
        }
      }
    }

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
      // First login via Better Auth — create mirror document.
      // The anonymous plugin sets isAnonymous and a generated email, so classify
      // the provider by isAnonymous (not email presence) and null the guest email.
      const isAnonymous = Boolean((session.user as { isAnonymous?: boolean }).isAnonymous);
      const email = isAnonymous ? null : (session.user.email ?? null);
      const isSuperAdmin = email ? env.SUPER_ADMIN_EMAILS.includes(email) : false;

      user = await UserModel.create({
        _id: session.user.id,
        displayName: session.user.name ?? 'User',
        email,
        photoURL: session.user.image ?? null,
        provider: isAnonymous ? 'guest' : 'google',
        managedBy: null,
        isSuperAdmin,
      });
    }

    // Keep isSuperAdmin in sync with SUPER_ADMIN_EMAILS for existing users
    // (it's only set at creation otherwise, so changing the env wouldn't apply).
    if (user.email) {
      const shouldBeSuper = env.SUPER_ADMIN_EMAILS.includes(user.email);
      if (shouldBeSuper !== user.isSuperAdmin) {
        user.isSuperAdmin = shouldBeSuper;
        await user.save();
      }
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[requireAuth]', err);
    res.status(500).json({ error: { code: 'AUTH_ERROR', message: 'Authentication check failed' } });
  }
}
