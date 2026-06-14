import TournamentModel, { type ITournamentDocument } from './tournaments.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function listTournaments(): Promise<ITournamentDocument[]> {
  return TournamentModel.find().sort({ year: -1 });
}

export async function getTournamentById(id: string): Promise<ITournamentDocument> {
  const tournament = await TournamentModel.findById(id);
  if (!tournament) throw new AppError(404, 'Tournament not found', 'NOT_FOUND');
  return tournament;
}
