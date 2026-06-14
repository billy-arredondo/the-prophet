/**
 * Domain document shapes (the canonical data model).
 * These describe the JSON shape returned by the API (ids as strings, dates as ISO strings),
 * which the web client consumes directly. The API maps Mongoose documents to these.
 */

export type AuthProvider = 'google' | 'guest';
export type MatchStage = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final' | 'third_place';
export type MatchStatus = 'upcoming' | 'live' | 'finished';
export type ResultSource = 'api' | 'manual';
/** Only 'private' in the MVP; 'public' reserved for a later phase. */
export type GroupVisibility = 'private' | 'public';
export type TournamentStatus = 'upcoming' | 'active' | 'finished';

export interface User {
  id: string;
  displayName: string;
  /** null for guest/managed (minor) profiles. */
  email: string | null;
  photoURL: string | null;
  provider: AuthProvider;
  /** For managed (minor) guest profiles: the admin userId who manages them. null otherwise. */
  managedBy: string | null;
  /** Platform-level super admin (confirms official match results). */
  isSuperAdmin: boolean;
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  year: number;
  status: TournamentStatus;
  /** Id/code from the external football API (e.g. football-data.org 'WC'). */
  externalId: string | null;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  tournamentId: string;
  createdBy: string;
  adminIds: string[];
  /** Includes admins. */
  memberIds: string[];
  inviteCode: string;
  visibility: GroupVisibility;
  createdAt: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  /** Id from the external football API (for sync/dedup). */
  externalId: string | null;
  stage: MatchStage;
  /** 'A'–'L' for group stage, null for knockouts. */
  groupStage: string | null;
  homeTeam: string;
  awayTeam: string;
  /** ISO 8601, UTC. */
  kickoff: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  /** Where the current (final) result came from. */
  resultSource: ResultSource | null;
  /** Super-admin who confirmed the official result. */
  confirmedBy: string | null;
  /** ISO 8601 when scoring ran for this match. */
  scoredAt: string | null;
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predictedHome: number;
  predictedAway: number;
  /** null until the match is finished + scored. Written only by the scoring service. */
  points: number | null;
  submittedAt: string;
  updatedAt: string;
}

export interface RankingEntry {
  id: string;
  groupId: string;
  userId: string;
  displayName: string;
  photoURL: string | null;
  totalPoints: number;
  predictionsCount: number;
  lastUpdated: string;
}
