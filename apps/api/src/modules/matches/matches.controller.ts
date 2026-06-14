import type { Request, Response, NextFunction } from 'express';
import * as matchesService from './matches.service.js';

export async function getMatchesByTournament(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const matches = await matchesService.getMatchesByTournament(req.params['id']!);
    res.json(matches.map((m) => m.toJSON()));
  } catch (err) {
    next(err);
  }
}

export async function getMatch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const match = await matchesService.getMatchById(req.params['id']!);
    res.json(match.toJSON());
  } catch (err) {
    next(err);
  }
}

export async function getPendingReview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const matches = await matchesService.getPendingReviewMatches();
    res.json(matches.map((m) => m.toJSON()));
  } catch (err) {
    next(err);
  }
}
