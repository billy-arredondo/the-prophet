import mongoose from 'mongoose';
import RankingModel, { type IRankingDocument } from './rankings.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getRankingForGroup(groupId: string): Promise<IRankingDocument[]> {
  const ranking = await RankingModel.find({ groupId: new mongoose.Types.ObjectId(groupId) }).sort({
    totalPoints: -1,
    predictionsCount: -1,
  });

  if (!ranking) throw new AppError(404, 'Ranking not found', 'NOT_FOUND');
  return ranking;
}

/**
 * Recompute and persist ranking for a set of (groupId, userId) pairs.
 * Called inside a transaction by the scoring service.
 * Uses bulk upsert for efficiency.
 *
 * @param entries - Array of { groupId, userId, displayName, photoURL, pointsDelta, predictionsCountDelta }
 * @param session - Mongoose ClientSession for transactional writes
 */
export async function bulkUpdateRankings(
  entries: Array<{
    groupId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    displayName: string;
    photoURL: string | null;
    pointsDelta: number;
    predictionsCountDelta: number;
  }>,
  session: mongoose.ClientSession,
): Promise<void> {
  const bulkOps = entries.map((e) => ({
    updateOne: {
      filter: { groupId: e.groupId, userId: e.userId },
      update: {
        $inc: { totalPoints: e.pointsDelta, predictionsCount: e.predictionsCountDelta },
        $set: {
          displayName: e.displayName,
          photoURL: e.photoURL,
          lastUpdated: new Date(),
        },
        $setOnInsert: { groupId: e.groupId, userId: e.userId },
      },
      upsert: true,
    },
  }));

  if (bulkOps.length > 0) {
    await RankingModel.bulkWrite(bulkOps, { session });
  }
}
