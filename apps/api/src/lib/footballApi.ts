/**
 * Provider-agnostic Football API client interface.
 * Swap in a real implementation (API-Football, football-data.org, etc.)
 * by implementing FootballApiClient and registering it in getFootballApiClient().
 */
import type { MatchStage, MatchStatus } from '@the-prophet/shared';

export interface FixtureDto {
  externalId: string;
  stage: MatchStage;
  groupStage: string | null;
  homeTeam: string;
  awayTeam: string;
  kickoff: Date;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
}

export interface FootballApiClient {
  /**
   * Fetch upcoming / scheduled fixtures for a tournament season.
   * @param tournamentExternalId - the provider-specific league/competition id
   * @param season - 4-digit year
   */
  getFixtures(tournamentExternalId: string, season: number): Promise<FixtureDto[]>;

  /**
   * Fetch live or recently-finished results.
   */
  getResults(tournamentExternalId: string, season: number): Promise<FixtureDto[]>;
}

/** Stub used when no FOOTBALL_API_KEY is configured. */
class NotConfiguredClient implements FootballApiClient {
  private readonly msg = 'Football API client not configured (FOOTBALL_API_KEY missing)';

  async getFixtures(): Promise<FixtureDto[]> {
    throw new Error(this.msg);
  }

  async getResults(): Promise<FixtureDto[]> {
    throw new Error(this.msg);
  }
}

// TODO: implement a real provider (e.g. ApiFootballClient) and select it
// via env.FOOTBALL_API_PROVIDER once the key is available.

let _client: FootballApiClient | null = null;

export function getFootballApiClient(): FootballApiClient {
  if (!_client) {
    _client = new NotConfiguredClient();
  }
  return _client;
}

/** Allow tests / bootstrap to inject a real or mock client. */
export function setFootballApiClient(client: FootballApiClient): void {
  _client = client;
}
