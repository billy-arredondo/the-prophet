/**
 * Environment configuration.
 * Loads .env, validates with Zod, and exports typed config.
 * Missing optional vars log a warning but never crash the process —
 * so /health and /docs work even in a bare-bones environment.
 */
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Database — optional so Swagger/health work without Mongo
  MONGODB_URI: z.string().url().optional(),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(1).default('dev-secret-change-me'),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:4000'),

  // Google OAuth — optional (skip social login in dev)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // CORS
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),

  // Football API — optional
  FOOTBALL_API_KEY: z.string().optional(),
  FOOTBALL_API_PROVIDER: z.string().optional(),

  // Security
  RECAPTCHA_SECRET: z.string().optional(),
  DEVICE_TOKEN_SECRET: z.string().min(1).default('dev-device-secret'),

  // Business rules
  MAX_GROUPS_PER_ADMIN: z.coerce.number().int().positive().default(10),

  // Super admins — comma-separated Google emails
  SUPER_ADMIN_EMAILS: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',').map((e) => e.trim()).filter(Boolean) : [])),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[env] Invalid environment variables:', parsed.error.flatten().fieldErrors);
  // Only hard-fail on truly critical config issues in production
  if (process.env['NODE_ENV'] === 'production') {
    process.exit(1);
  }
}

// Provide safe defaults so the server always boots
export const env = parsed.success ? parsed.data : envSchema.parse({});

// Warn about missing optional but important vars
if (!env.MONGODB_URI) {
  console.warn('[env] MONGODB_URI is not set — database features will be unavailable');
}
if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
  console.warn('[env] Google OAuth credentials not set — Google login will be unavailable');
}
