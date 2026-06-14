import { z } from 'zod';
import { MAX_GOALS, MIN_GOALS } from './constants';

/** Shared enum schemas (kept in sync with types.ts). */
export const matchStageSchema = z.enum(['group', 'r32', 'r16', 'qf', 'sf', 'final', 'third_place']);
export const matchStatusSchema = z.enum(['upcoming', 'live', 'finished']);

/** Query params for GET /api/matches (list, optionally filtered). */
export const matchListQuerySchema = z.object({
  status: matchStatusSchema.optional(),
  tournamentId: z.string().min(1).optional(),
});
export type MatchListQuery = z.infer<typeof matchListQuerySchema>;

const goals = z.number().int().min(MIN_GOALS).max(MAX_GOALS);
const displayName = z.string().trim().min(1).max(40);

/** ---- Users / profile ---- */
export const updateProfileSchema = z.object({
  displayName: displayName.optional(),
  photoURL: z.string().url().nullable().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const createManagedMemberSchema = z.object({
  displayName,
});
export type CreateManagedMemberInput = z.infer<typeof createManagedMemberSchema>;

/** ---- Groups ---- */
export const createGroupSchema = z.object({
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().max(280).default(''),
  tournamentId: z.string().min(1),
});
export type CreateGroupInput = z.infer<typeof createGroupSchema>;

export const updateGroupSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  description: z.string().trim().max(280).optional(),
});
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;

export const joinGroupSchema = z.object({
  inviteCode: z.string().trim().min(4).max(16),
});
export type JoinGroupInput = z.infer<typeof joinGroupSchema>;

/** ---- Predictions ---- */
export const upsertPredictionSchema = z.object({
  predictedHome: goals,
  predictedAway: goals,
});
export type UpsertPredictionInput = z.infer<typeof upsertPredictionSchema>;

/** ---- Results (super-admin) ---- */
export const confirmResultSchema = z.object({
  /** Optional override of the API-proposed result; if omitted, the synced API result is confirmed. */
  homeScore: goals.optional(),
  awayScore: goals.optional(),
});
export type ConfirmResultInput = z.infer<typeof confirmResultSchema>;

export const overrideResultSchema = z.object({
  homeScore: goals,
  awayScore: goals,
});
export type OverrideResultInput = z.infer<typeof overrideResultSchema>;
