/**
 * Match sync cron job.
 * Polls the configured football API to upsert fixtures and update live scores.
 * No-op (with a log) if FOOTBALL_API_KEY is not configured.
 *
 * Schedule: every 2 minutes while matches are live, otherwise every 30 min.
 * For simplicity this skeleton uses a single 2-minute schedule.
 *
 * TODO: implement real upsert logic once a football API provider is chosen.
 */
import cron from 'node-cron';
import { env } from '../config/env.js';
import { getFootballApiClient } from '../lib/footballApi.js';
import MatchModel from '../modules/matches/matches.model.js';
import TournamentModel from '../modules/tournaments/tournaments.model.js';

async function syncAllActiveTournaments(): Promise<void> {
  if (!env.FOOTBALL_API_KEY) {
    // Logged at startup; skip silently during scheduled runs
    return;
  }

  const client = getFootballApiClient();

  try {
    // Find active tournaments to sync
    const tournaments = await TournamentModel.find({ status: 'active' });

    for (const tournament of tournaments) {
      const externalTournamentId = tournament.externalId ?? '';
      if (!externalTournamentId) continue;

      const fixtures = await client.getFixtures(externalTournamentId, tournament.year);

      for (const fixture of fixtures) {
        await MatchModel.findOneAndUpdate(
          { externalId: fixture.externalId },
          {
            $set: {
              tournamentId: tournament._id,
              externalId: fixture.externalId,
              stage: fixture.stage,
              groupStage: fixture.groupStage,
              homeTeam: fixture.homeTeam,
              awayTeam: fixture.awayTeam,
              kickoff: fixture.kickoff,
              homeScore: fixture.homeScore,
              awayScore: fixture.awayScore,
              status: fixture.status,
              // resultSource is set by the scoring service, not here
            },
          },
          { upsert: true, new: true },
        );
      }

      console.info(`[syncMatches] Synced ${fixtures.length} fixtures for ${tournament.name}`);
    }
  } catch (err) {
    console.error('[syncMatches] Sync failed:', err);
  }
}

/** Register the cron job. Called from server.ts after DB connects. */
export function startSyncJob(): void {
  if (!env.FOOTBALL_API_KEY) {
    console.info('[syncMatches] FOOTBALL_API_KEY not set — match sync job disabled');
    return;
  }

  // Run every 5 minutes (stays well under football-data.org's ~10 req/min free tier).
  cron.schedule('*/5 * * * *', () => {
    void syncAllActiveTournaments();
  });

  console.info('[syncMatches] Match sync job started (every 5 minutes)');

  // Run immediately on startup
  void syncAllActiveTournaments();
}
