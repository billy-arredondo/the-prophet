import mongoose, { Schema, type Document } from 'mongoose';
import type { TournamentStatus } from '@the-prophet/shared';

export interface ITournamentDocument extends Document {
  name: string;
  year: number;
  status: TournamentStatus;
}

const tournamentSchema = new Schema<ITournamentDocument>({
  name: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'finished'],
    default: 'upcoming',
  },
});

tournamentSchema.index({ year: 1 });

const TournamentModel = mongoose.model<ITournamentDocument>('Tournament', tournamentSchema);
export default TournamentModel;
