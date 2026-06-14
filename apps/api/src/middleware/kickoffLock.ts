/**
 * kickoffLock middleware.
 * Rejects prediction writes when the current time is >= match kickoff.
 * Must run AFTER requireAuth; reads matchId from req.params.id.
 */
import type { Request, Response, NextFunction } from 'express';
import MatchModel from '../modules/matches/matches.model.js';

export async function kickoffLock(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const matchId = req.params['id'];
    const match = await MatchModel.findById(matchId).lean();

    if (!match) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Match not found' } });
      return;
    }

    if (new Date() >= new Date(match.kickoff)) {
      res.status(409).json({
        error: {
          code: 'KICKOFF_LOCKED',
          message: 'Predictions are locked — the match has already started',
        },
      });
      return;
    }

    next();
  } catch (err) {
    console.error('[kickoffLock]', err);
    next(err);
  }
}
