import type { Request, Response, NextFunction } from 'express';
import * as predictionsService from './predictions.service.js';

export async function upsertPrediction(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const prediction = await predictionsService.upsertPrediction(
      String(req.user!._id),
      req.params['id']!,
      req.body,
    );
    res.json(prediction.toJSON());
  } catch (err) {
    next(err);
  }
}

export async function getMyPredictions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const predictions = await predictionsService.getPredictionsForUser(String(req.user!._id));
    res.json(predictions.map((p) => p.toJSON()));
  } catch (err) {
    next(err);
  }
}
