import { Router } from 'express';
import { upsertPredictionSchema } from '@the-prophet/shared';
import { requireAuth } from '../../middleware/requireAuth.js';
import { kickoffLock } from '../../middleware/kickoffLock.js';
import { validate } from '../../middleware/validate.js';
import * as ctrl from './predictions.controller.js';

const router = Router();

router.use(requireAuth);

// PUT /matches/:id/prediction — create or update a prediction (locked at kickoff)
router.put(
  '/matches/:id/prediction',
  kickoffLock,
  validate(upsertPredictionSchema),
  ctrl.upsertPrediction,
);

// GET /me/predictions — get all predictions for the current user
router.get('/me/predictions', ctrl.getMyPredictions);

export default router;
