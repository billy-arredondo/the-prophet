import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireGroupMember } from '../../middleware/requireGroupMember.js';
import * as ctrl from './rankings.controller.js';

const router = Router();

router.use(requireAuth);

// GET /groups/:id/ranking
router.get('/groups/:id/ranking', requireGroupMember, ctrl.getGroupRanking);

export default router;
