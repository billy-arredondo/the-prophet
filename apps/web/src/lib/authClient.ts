/**
 * Better Auth browser client.
 * Single source of truth for auth actions (Google social, anonymous guest,
 * session, sign-out). baseURL points at the API; the client appends the
 * default `/api/auth` base path and sends cookies (credentials: 'include').
 *
 * Note: the domain User (with isSuperAdmin/managedBy/provider) lives in our
 * own `users` collection and is fetched via GET /api/me — see authStore usage.
 * Better Auth's session.user is only the auth identity.
 */
import { createAuthClient } from 'better-auth/react';
import { anonymousClient } from 'better-auth/client/plugins';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  plugins: [anonymousClient()],
});
