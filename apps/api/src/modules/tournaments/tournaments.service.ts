import TournamentModel, { type ITournamentDocument } from './tournaments.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function listTournaments(): Promise<ITournamentDocument[]> {
  return TournamentModel.find().sort({ year: -1 });
}

/**
 * Idempotently ensure the default tournament exists. Groups reference a real
 * tournament id; until the football-API seed (Fase 3) lands, this guarantees
 * there is at least one tournament to attach groups to. Safe to call on boot.
 */
export async function ensureDefaultTournament(): Promise<ITournamentDocument> {
  const existing = await TournamentModel.findOne({ year: 2026 });
  if (existing) return existing;
  return TournamentModel.create({ name: 'Mundial 2026', year: 2026, status: 'active' });
}

export async function getTournamentById(id: string): Promise<ITournamentDocument> {
  const tournament = await TournamentModel.findById(id);
  if (!tournament) throw new AppError(404, 'Tournament not found', 'NOT_FOUND');
  return tournament;
}
