/**
 * Better Auth instance.
 * Guards against missing Mongo connection so importing this module
 * never crashes the process when the DB is unavailable.
 *
 * Usage in Express: app.all('/api/auth/*', toNodeHandler(auth))
 * Read session: auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
 *
 * Call order: connectDb() → initAuth() → createApp() → listen()
 */
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { anonymous } from 'better-auth/plugins';
import { env } from '../config/env.js';
import { getNativeDb } from './db.js';

type BetterAuthInstance = ReturnType<typeof betterAuth>;

function buildAuth(): BetterAuthInstance {
  const db = getNativeDb();

  if (!db) {
    console.warn('[auth] MongoDB not connected — Better Auth not fully initialised');
  }

  const socialProviders: Record<string, unknown> = {};
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    socialProviders['google'] = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: Parameters<typeof betterAuth>[0] = {
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    socialProviders: socialProviders as Parameters<typeof betterAuth>[0]['socialProviders'],
    plugins: [anonymous()],
    trustedOrigins: [env.WEB_ORIGIN],
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 min client-side cache
      },
    },
  };

  // Only attach the DB adapter when a connection is available
  if (db) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config.database = mongodbAdapter(db as any);
  }

  return betterAuth(config);
}

// Lazily-built singleton. Rebuilt after connectDb() via initAuth().
let _auth: BetterAuthInstance | null = null;

export function getAuth(): BetterAuthInstance {
  if (!_auth) {
    _auth = buildAuth();
  }
  return _auth;
}

/** Call once after connectDb() to create the auth instance with a live DB. */
export function initAuth(): void {
  _auth = buildAuth();
}
