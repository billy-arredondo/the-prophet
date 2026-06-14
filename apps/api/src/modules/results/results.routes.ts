import { Router } from 'express';
import { confirmResultSchema, overrideResultSchema } from '@the-prophet/shared';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireSuperAdmin } from '../../middleware/requireSuperAdmin.js';
import { validate } from '../../middleware/validate.js';
import * as ctrl from './results.controller.js';

const router = Router();

// All results routes: must be authenticated + super-admin
router.use(requireAuth, requireSuperAdmin);

// GET /matches/pending-review
router.get('/matches/pending-review', ctrl.listPendingReview);

// POST /matches/:id/confirm-result
router.post(
  '/matches/:id/confirm-result',
  validate(confirmResultSchema),
  ctrl.confirmMatchResult,
);

// PATCH /matches/:id/result
router.patch('/matches/:id/result', validate(overrideResultSchema), ctrl.overrideMatchResult);

export default router;
