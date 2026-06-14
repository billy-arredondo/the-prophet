import MatchModel, { type IMatchDocument } from './matches.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getMatchesByTournament(tournamentId: string): Promise<IMatchDocument[]> {
  return MatchModel.find({ tournamentId }).sort({ kickoff: 1 });
}

export async function getMatchById(id: string): Promise<IMatchDocument> {
  const match = await MatchModel.findById(id);
  if (!match) throw new AppError(404, 'Match not found', 'NOT_FOUND');
  return match;
}

/** Returns matches that are finished but haven't been confirmed/scored yet. */
export async function getPendingReviewMatches(): Promise<IMatchDocument[]> {
  return MatchModel.find({ status: 'finished', scoredAt: null }).sort({ kickoff: 1 });
}
