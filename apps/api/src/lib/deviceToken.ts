/**
 * Device tokens for managed (minor) members.
 *
 * Managed members are domain `users` documents (not Better Auth users), so they
 * can't get a Better Auth session. Instead, an admin issues a signed device
 * token (link/QR); the device redeems it for a long-lived HttpOnly cookie, and
 * requireAuth accepts that cookie. See middleware/requireAuth.ts.
 *
 * MVP limitation: tokens are stateless (no denylist), so re-issuing a link does
 * not invalidate previous ones until they expire.
 */
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/** Long-lived: the minor stays signed in on their device. */
export const DEVICE_TOKEN_MAX_AGE_S = 60 * 60 * 24 * 90; // 90 days
export const DEVICE_COOKIE_NAME = 'device_token';

interface DevicePayload {
  sub: string; // managed member id
  typ: 'device';
}

/** Sign a device token embedding the managed member id. */
export function signDeviceToken(memberId: string): string {
  return jwt.sign({ sub: memberId, typ: 'device' }, env.DEVICE_TOKEN_SECRET, {
    expiresIn: DEVICE_TOKEN_MAX_AGE_S,
  });
}

/** Verify a device token; returns the member id or null if invalid/expired. */
export function verifyDeviceToken(token: string): { memberId: string } | null {
  try {
    const decoded = jwt.verify(token, env.DEVICE_TOKEN_SECRET) as DevicePayload;
    if (decoded.typ !== 'device' || !decoded.sub) return null;
    return { memberId: decoded.sub };
  } catch {
    return null;
  }
}

/** Read the device token from a raw Cookie header (no cookie-parser dep). */
export function readDeviceCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === DEVICE_COOKIE_NAME) return decodeURIComponent(rest.join('='));
  }
  return null;
}
