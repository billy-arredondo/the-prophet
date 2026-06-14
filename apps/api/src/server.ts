/**
 * Server entry point.
 * Connects to MongoDB, initialises Better Auth, starts the cron job,
 * then begins listening.
 *
 * /health and /docs work even without a DB connection.
 */
import { connectDb } from './lib/db.js';
import { initAuth } from './lib/auth.js';
import { createApp } from './app.js';
import { startSyncJob } from './jobs/syncMatches.js';
import { env } from './config/env.js';

async function main() {
  // Connect to MongoDB (non-fatal if unavailable)
  await connectDb();

  // Initialise Better Auth now that the DB connection is established
  initAuth();

  // Start match sync cron (no-op if no API key)
  startSyncJob();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.info(`[server] The Prophet API running on http://localhost:${env.PORT}`);
    console.info(`[server] Docs: http://localhost:${env.PORT}/docs`);
    console.info(`[server] Health: http://localhost:${env.PORT}/health`);
  });
}

main().catch((err) => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});
