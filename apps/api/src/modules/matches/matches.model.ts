import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { MatchStage, MatchStatus, ResultSource } from '@the-prophet/shared';

export interface IMatchDocument extends Document {
  tournamentId: Types.ObjectId;
  externalId: string | null;
  stage: MatchStage;
  groupStage: string | null;
  homeTeam: string;
  awayTeam: string;
  kickoff: Date;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  resultSource: ResultSource | null;
  confirmedBy: Types.ObjectId | null;
  scoredAt: Date | null;
}

const matchSchema = new Schema<IMatchDocument>({
  tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
  externalId: { type: String, default: null },
  stage: {
    type: String,
    enum: ['group', 'r32', 'r16', 'qf', 'sf', 'final', 'third_place'],
    required: true,
  },
  groupStage: { type: String, default: null },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  kickoff: { type: Date, required: true },
  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },
  status: { type: String, enum: ['upcoming', 'live', 'finished'], default: 'upcoming' },
  resultSource: { type: String, enum: ['api', 'manual', null], default: null },
  confirmedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  scoredAt: { type: Date, default: null },
});

matchSchema.index({ tournamentId: 1, kickoff: 1 });
matchSchema.index({ externalId: 1 }, { sparse: true });
matchSchema.index({ status: 1 });

const MatchModel = mongoose.model<IMatchDocument>('Match', matchSchema);
export default MatchModel;
