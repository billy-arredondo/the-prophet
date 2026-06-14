import type { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env.js';
import { getNativeDb } from '../../lib/db.js';
import UserModel from '../users/users.model.js';
import {
  verifyDeviceToken,
  DEVICE_COOKIE_NAME,
  DEVICE_TOKEN_MAX_AGE_S,
} from '../../lib/deviceToken.js';

/**
 * Redeem a managed-member device token for a long-lived device cookie.
 * Public route (this is how a managed minor signs in on their device).
 */
export async function redeemDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!getNativeDb()) {
      res.status(503).json({ error: { code: 'DB_UNAVAILABLE', message: 'Database not connected' } });
      return;
    }

    const token = typeof req.body?.token === 'string' ? req.body.token : '';
    const result = verifyDeviceToken(token);
    if (!result) {
      res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired device token' } });
      return;
    }

    const member = await UserModel.findById(result.memberId);
    if (!member || member.provider !== 'guest' || !member.managedBy) {
      res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Device token does not match a managed profile' } });
      return;
    }

    res.cookie(DEVICE_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      maxAge: DEVICE_TOKEN_MAX_AGE_S * 1000,
      path: '/',
    });
    res.json(member.toJSON());
  } catch (err) {
    next(err);
  }
}

/** Clear the device cookie (managed-member sign-out on this device). */
export function logoutDevice(_req: Request, res: Response): void {
  res.clearCookie(DEVICE_COOKIE_NAME, { path: '/' });
  res.status(204).end();
}
