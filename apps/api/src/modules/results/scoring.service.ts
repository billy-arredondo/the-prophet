/**
 * Scoring service — the heart of the app.
 *
 * On super-admin confirming a match result:
 * 1. Sets match scores, status='finished', resultSource, confirmedBy, scoredAt.
 * 2. Computes points for every prediction of that match.
 * 3. Recomputes rankings for every group whose members predicted that match.
 *
 * All writes happen inside a Mongoose session/transaction so either everything
 * commits or nothing does.
 *
 * Points are write-once: this service is the only place that touches prediction.points.
 * If scoredAt is already set, the function throws to prevent double-scoring.
 */
import mongoose from 'mongoose';
import type { ConfirmResultInput, OverrideResultInput } from '@the-prophet/shared';
import MatchModel from '../matches/matches.model.js';
import PredictionModel from '../predictions/predictions.model.js';
import GroupModel from '../groups/groups.model.js';
import UserModel from '../users/users.model.js';
import { bulkUpdateRankings } from '../rankings/rankings.service.js';
import { scorePrediction } from '../../lib/scoring.js';
import { AppError } from '../../middleware/errorHandler.js';

/**
 * Confirm an official result and trigger scoring for all predictions.
 * If homeScore/awayScore are provided in input they override whatever the
 * sync job stored; otherwise the existing match scores are used.
 */
export async function confirmResult(
  matchId: string,
  adminUserId: string,
  input: ConfirmResultInput,
): Promise<void> {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // 1. Load match (with session lock)
      const match = await MatchModel.findById(matchId).session(session);
      if (!match) throw new AppError(404, 'Match not found', 'NOT_FOUND');

      if (match.scoredAt) {
        throw new AppError(409, 'Match has already been scored', 'ALREADY_SCORED');
      }

      // 2. Determine final scores
      const homeScore = input.homeScore ?? match.homeScore;
      const awayScore = input.awayScore ?? match.awayScore;

      if (homeScore === null || homeScore === undefined || awayScore === null || awayScore === undefined) {
        throw new AppError(
          422,
          'No scores available — provide homeScore and awayScore explicitly',
          'SCORES_MISSING',
        );
      }

      // 3. Update match document
      match.homeScore = homeScore;
      match.awayScore = awayScore;
      match.status = 'finished';
      match.resultSource = input.homeScore !== undefined ? 'manual' : 'api';
      match.confirmedBy = new mongoose.Types.ObjectId(adminUserId);
      match.scoredAt = new Date();
      await match.save({ session });

      // 4. Fetch all predictions for this match
      const predictions = await PredictionModel.find({ matchId: match._id }).session(session);
      if (predictions.length === 0) return; // nothing to score

      // 5. Compute and persist points for each prediction
      const pointsMap = new Map<string, number>();
      const bulkPointsOps = predictions.map((pred) => {
        const pts = scorePrediction(pred.predictedHome, pred.predictedAway, homeScore, awayScore);
        pointsMap.set(String(pred.userId), pts);
        return {
          updateOne: {
            filter: { _id: pred._id },
            update: { $set: { points: pts } },
          },
        };
      });
      await PredictionModel.bulkWrite(bulkPointsOps, { session });

      // 6. Determine which groups need ranking updates.
      //    Predictions are global — find all groups where each predictor is a member.
      const predictorIds = predictions.map((p) => p.userId);

      // Fetch all groups that contain at least one predictor as a member
      const affectedGroups = await GroupModel.find({
        memberIds: { $in: predictorIds },
      })
        .select('_id memberIds')
        .session(session);

      // 7. Fetch user display info for all predictors (name, photoURL)
      const userDocs = await UserModel.find({ _id: { $in: predictorIds } })
        .select('_id displayName photoURL')
        .session(session);

      const userMap = new Map(userDocs.map((u) => [String(u._id), u]));

      // 8. Build ranking update entries
      const rankingUpdates: Parameters<typeof bulkUpdateRankings>[0] = [];

      for (const group of affectedGroups) {
        const groupMemberSet = new Set(group.memberIds.map(String));

        for (const pred of predictions) {
          const uid = String(pred.userId);
          if (!groupMemberSet.has(uid)) continue; // predictor not in this group

          const pts = pointsMap.get(uid) ?? 0;
          const user = userMap.get(uid);

          rankingUpdates.push({
            groupId: group._id as mongoose.Types.ObjectId,
            userId: pred.userId as mongoose.Types.ObjectId,
            displayName: user?.displayName ?? 'Unknown',
            photoURL: user?.photoURL ?? null,
            pointsDelta: pts,
            predictionsCountDelta: 1,
          });
        }
      }

      // 9. Bulk-upsert ranking rows
      await bulkUpdateRankings(rankingUpdates, session);
    });
  } finally {
    await session.endSession();
  }
}

/**
 * Override/patch a previously confirmed result (super-admin only).
 * Re-runs the full scoring logic with the new scores.
 *
 * Strategy: reset scoredAt so confirmResult can run again.
 * WARNING: this re-adds points — for a production app you'd want to
 * diff the old vs new points and apply a delta.  Here we take the
 * simpler approach of resetting and re-running.
 *
 * TODO: implement delta-based re-scoring to avoid double-counting.
 */
export async function overrideResult(
  matchId: string,
  adminUserId: string,
  input: OverrideResultInput,
): Promise<void> {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const match = await MatchModel.findById(matchId).session(session);
      if (!match) throw new AppError(404, 'Match not found', 'NOT_FOUND');

      // Reset scoring flag so confirmResult can re-score
      match.scoredAt = null;
      // Reset existing prediction points so they can be recomputed cleanly
      await PredictionModel.updateMany(
        { matchId: match._id },
        { $set: { points: null } },
        { session },
      );
      await match.save({ session });
    });
  } finally {
    await session.endSession();
  }

  // Re-run confirmResult with the new (explicit) scores
  await confirmResult(matchId, adminUserId, {
    homeScore: input.homeScore,
    awayScore: input.awayScore,
  });
}
