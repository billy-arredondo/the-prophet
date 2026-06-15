import { Router } from 'express';
import { confirmResultSchema, overrideResultSchema } from '@the-prophet/shared';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireSuperAdmin } from '../../middleware/requireSuperAdmin.js';
import { validate } from '../../middleware/validate.js';
import * as ctrl from './results.controller.js';

const router = Router();

// Authenticated for the whole router; super-admin is applied PER-ROUTE (not as a
// blanket router.use) so a non-matching request falls through to later routers
// instead of being 403'd here — e.g. GET /groups/:id/ranking (rankingsRouter is
// mounted after this one).
router.use(requireAuth);

// POST /matches/:id/confirm-result
router.post(
  '/matches/:id/confirm-result',
  requireSuperAdmin,
  validate(confirmResultSchema),
  ctrl.confirmMatchResult,
);

// PATCH /matches/:id/result
router.patch(
  '/matches/:id/result',
  requireSuperAdmin,
  validate(overrideResultSchema),
  ctrl.overrideMatchResult,
);

export default router;
