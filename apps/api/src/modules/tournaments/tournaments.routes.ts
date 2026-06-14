import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import * as ctrl from './tournaments.controller.js';

const router = Router();

router.use(requireAuth);

// GET /tournaments
router.get('/tournaments', ctrl.listTournaments);

// GET /tournaments/:id
router.get('/tournaments/:id', ctrl.getTournament);

export default router;
