import type { Request, Response, NextFunction } from 'express';
import * as tournamentsService from './tournaments.service.js';

export async function listTournaments(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tournaments = await tournamentsService.listTournaments();
    res.json(tournaments.map((t) => t.toJSON()));
  } catch (err) {
    next(err);
  }
}

export async function getTournament(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tournament = await tournamentsService.getTournamentById(req.params['id']!);
    res.json(tournament.toJSON());
  } catch (err) {
    next(err);
  }
}
