import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IRankingDocument extends Document {
  groupId: Types.ObjectId;
  userId: Types.ObjectId;
  displayName: string;
  photoURL: string | null;
  totalPoints: number;
  predictionsCount: number;
  lastUpdated: Date;
}

const rankingSchema = new Schema<IRankingDocument>({
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  displayName: { type: String, required: true },
  photoURL: { type: String, default: null },
  totalPoints: { type: Number, default: 0 },
  predictionsCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: () => new Date() },
});

// One entry per user per group
rankingSchema.index({ groupId: 1, userId: 1 }, { unique: true });
// Leaderboard query: descending points within a group
rankingSchema.index({ groupId: 1, totalPoints: -1 });

const RankingModel = mongoose.model<IRankingDocument>('Ranking', rankingSchema);
export default RankingModel;
