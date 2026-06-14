import type { Request, Response, NextFunction } from 'express';
import { getRankingForGroup } from './rankings.service.js';

export async function getGroupRanking(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const ranking = await getRankingForGroup(req.params['id']!);
    res.json(ranking.map((r) => r.toJSON()));
  } catch (err) {
    next(err);
  }
}
