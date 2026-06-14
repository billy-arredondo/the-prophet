import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IPredictionDocument extends Document {
  userId: Types.ObjectId;
  matchId: Types.ObjectId;
  predictedHome: number;
  predictedAway: number;
  /** null until the match is finished and scored */
  points: number | null;
  submittedAt: Date;
  updatedAt: Date;
}

const predictionSchema = new Schema<IPredictionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    predictedHome: { type: Number, required: true, min: 0, max: 99 },
    predictedAway: { type: Number, required: true, min: 0, max: 99 },
    // points are written exclusively by the scoring service
    points: { type: Number, default: null },
    submittedAt: { type: Date },
    updatedAt: { type: Date },
  },
  { timestamps: { createdAt: 'submittedAt', updatedAt: 'updatedAt' } },
);

// One prediction per user per match — enforced at DB level
predictionSchema.index({ userId: 1, matchId: 1 }, { unique: true });
predictionSchema.index({ matchId: 1 });

const PredictionModel = mongoose.model<IPredictionDocument>('Prediction', predictionSchema);
export default PredictionModel;
