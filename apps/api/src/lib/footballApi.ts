/**
 * Provider-agnostic Football API client interface.
 * Swap in a real implementation (API-Football, football-data.org, etc.)
 * by implementing FootballApiClient and registering it in getFootballApiClient().
 */
import type { MatchStage, MatchStatus } from '@the-prophet/shared';
import { env } from '../config/env.js';

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

// ── football-data.org provider ───────────────────────────────────────────────

interface FdMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  homeTeam: { name: string | null } | null;
  awayTeam: { name: string | null } | null;
  score: { fullTime: { home: number | null; away: number | null } } | null;
}

const FD_STAGE_MAP: Record<string, MatchStage> = {
  GROUP_STAGE: 'group',
  LAST_32: 'r32',
  LAST_16: 'r16',
  QUARTER_FINALS: 'qf',
  SEMI_FINALS: 'sf',
  THIRD_PLACE: 'third_place',
  FINAL: 'final',
};

function mapStage(stage: string): MatchStage {
  return FD_STAGE_MAP[stage] ?? 'group';
}

function mapStatus(status: string): MatchStatus {
  if (status === 'IN_PLAY' || status === 'PAUSED') return 'live';
  if (status === 'FINISHED') return 'finished';
  return 'upcoming'; // SCHEDULED, TIMED, POSTPONED, SUSPENDED, …
}

function mapGroup(group: string | null): string | null {
  return group?.startsWith('GROUP_') ? group.slice('GROUP_'.length) : null;
}

/**
 * football-data.org client (https://www.football-data.org). Free tier: ~10
 * req/min — we read X-Requests-Available-Minute and bail on 429 to stay under
 * the limit. Auth via X-Auth-Token header.
 */
class FootballDataOrgClient implements FootballApiClient {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl = 'https://api.football-data.org/v4',
  ) {}

  private async fetchMatches(competitionCode: string): Promise<FixtureDto[]> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/competitions/${competitionCode}/matches`, {
        headers: { 'X-Auth-Token': this.apiKey },
        signal: AbortSignal.timeout(15_000),
      });
    } catch (err) {
      console.warn('[footballApi] request failed:', err);
      return [];
    }

    if (res.status === 429) {
      console.warn('[footballApi] rate limited (429) — skipping this run');
      return [];
    }
    if (!res.ok) {
      console.warn(`[footballApi] football-data.org responded ${res.status}`);
      return [];
    }

    const remaining = res.headers.get('x-requests-available-minute');
    if (remaining) console.info(`[footballApi] requests available this minute: ${remaining}`);

    const data = (await res.json()) as { matches?: FdMatch[] };
    return (data.matches ?? []).map((m) => ({
      externalId: String(m.id),
      stage: mapStage(m.stage),
      groupStage: mapGroup(m.group),
      homeTeam: m.homeTeam?.name ?? 'TBD',
      awayTeam: m.awayTeam?.name ?? 'TBD',
      kickoff: new Date(m.utcDate),
      homeScore: m.score?.fullTime?.home ?? null,
      awayScore: m.score?.fullTime?.away ?? null,
      status: mapStatus(m.status),
    }));
  }

  async getFixtures(competitionCode: string): Promise<FixtureDto[]> {
    return this.fetchMatches(competitionCode);
  }

  async getResults(competitionCode: string): Promise<FixtureDto[]> {
    const all = await this.fetchMatches(competitionCode);
    return all.filter((f) => f.status === 'live' || f.status === 'finished');
  }
}

// ── Singleton factory ─────────────────────────────────────────────────────────

let _client: FootballApiClient | null = null;

export function getFootballApiClient(): FootballApiClient {
  if (!_client) {
    if (env.FOOTBALL_API_KEY && env.FOOTBALL_API_PROVIDER === 'football-data') {
      _client = new FootballDataOrgClient(env.FOOTBALL_API_KEY);
    } else {
      _client = new NotConfiguredClient();
    }
  }
  return _client;
}

/** Allow tests / bootstrap to inject a real or mock client. */
export function setFootballApiClient(client: FootballApiClient): void {
  _client = client;
}
