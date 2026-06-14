/**
 * Predictions service.
 * Implements prediction upsert (one per user per match, locked at kickoff).
 * Points are written only by the scoring service, never here.
 */
import mongoose from 'mongoose';
import type { UpsertPredictionInput } from '@the-prophet/shared';
import PredictionModel, { type IPredictionDocument } from './predictions.model.js';
import { AppError } from '../../middleware/errorHandler.js';

/**
 * Upsert a prediction.
 * The kickoffLock middleware already verified the match hasn't started —
 * we use findOneAndUpdate with upsert to atomically create-or-update.
 * Points field is NOT touched here (scoring service owns it).
 */
export async function upsertPrediction(
  userId: string,
  matchId: string,
  input: UpsertPredictionInput,
): Promise<IPredictionDocument> {
  const uid = new mongoose.Types.ObjectId(userId);
  const mid = new mongoose.Types.ObjectId(matchId);

  const prediction = await PredictionModel.findOneAndUpdate(
    { userId: uid, matchId: mid },
    {
      $set: {
        predictedHome: input.predictedHome,
        predictedAway: input.predictedAway,
      },
      $setOnInsert: { submittedAt: new Date() },
    },
    { upsert: true, new: true },
  );

  if (!prediction) throw new AppError(500, 'Failed to upsert prediction', 'UPSERT_ERROR');
  return prediction;
}

/** Get all predictions for the current user, optionally filtered by matchId list. */
export async function getPredictionsForUser(userId: string): Promise<IPredictionDocument[]> {
  return PredictionModel.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({
    updatedAt: -1,
  });
}

/** Get all predictions for a specific match (used by scoring service). */
export async function getPredictionsForMatch(matchId: string): Promise<IPredictionDocument[]> {
  return PredictionModel.find({ matchId: new mongoose.Types.ObjectId(matchId) });
}
