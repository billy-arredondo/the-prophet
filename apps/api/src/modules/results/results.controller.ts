import type { Request, Response, NextFunction } from 'express';
import { confirmResult, overrideResult } from './scoring.service.js';
import { getPendingReviewMatches } from '../matches/matches.service.js';

export async function listPendingReview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const matches = await getPendingReviewMatches();
    res.json(matches.map((m) => m.toJSON()));
  } catch (err) {
    next(err);
  }
}

export async function confirmMatchResult(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await confirmResult(req.params['id']!, String(req.user!._id), req.body);
    res.json({ message: 'Result confirmed and scoring triggered' });
  } catch (err) {
    next(err);
  }
}

export async function overrideMatchResult(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await overrideResult(req.params['id']!, String(req.user!._id), req.body);
    res.json({ message: 'Result overridden and re-scoring triggered' });
  } catch (err) {
    next(err);
  }
}
