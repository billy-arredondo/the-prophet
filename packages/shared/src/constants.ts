/**
 * Domain constants shared across the API and the web client.
 * Keep this free of runtime dependencies.
 */

/** Points scheme (configurable per tournament in a future phase). */
export const POINTS = {
  /** Exact final score predicted. */
  EXACT: 3,
  /** Correct outcome (winner or draw) but wrong score. */
  OUTCOME: 1,
  /** Wrong. */
  WRONG: 0,
} as const;

/** Default cap for how many groups a single user may be admin of. Mirrored by MAX_GROUPS_PER_ADMIN env. */
export const DEFAULT_MAX_GROUPS_PER_ADMIN = 10;

/** Invite code format: uppercase alphanumeric, no ambiguous chars. */
export const INVITE_CODE_LENGTH = 7;
export const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** A predicted/actual score for one team is bounded to a sane range. */
export const MIN_GOALS = 0;
export const MAX_GOALS = 99;
