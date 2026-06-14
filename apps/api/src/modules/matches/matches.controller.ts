import type { Request, Response, NextFunction } from 'express';
import { matchListQuerySchema } from '@the-prophet/shared';
import * as matchesService from './matches.service.js';

export async function getMatches(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = matchListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: parsed.error.flatten().fieldErrors,
        },
      });
      return;
    }
    const matches = await matchesService.getMatches(parsed.data);
    res.json(matches.map((m) => m.toJSON()));
  } catch (err) {
    next(err);
  }
}

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
