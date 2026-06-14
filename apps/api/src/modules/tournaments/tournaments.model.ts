import mongoose, { Schema, type Document } from 'mongoose';
import type { TournamentStatus } from '@the-prophet/shared';

export interface ITournamentDocument extends Document {
  name: string;
  year: number;
  status: TournamentStatus;
  externalId: string | null;
}

const tournamentSchema = new Schema<ITournamentDocument>({
  name: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'finished'],
    default: 'upcoming',
  },
  // External football-API competition code/id (e.g. football-data.org 'WC').
  externalId: { type: String, default: null },
});

tournamentSchema.index({ year: 1 });

const TournamentModel = mongoose.model<ITournamentDocument>('Tournament', tournamentSchema);
export default TournamentModel;
