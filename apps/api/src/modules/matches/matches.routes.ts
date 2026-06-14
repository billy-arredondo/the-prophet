import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import * as ctrl from './matches.controller.js';

const router = Router();

router.use(requireAuth);

// GET /tournaments/:id/matches
router.get('/tournaments/:id/matches', ctrl.getMatchesByTournament);

// GET /matches?status=&tournamentId=
router.get('/matches', ctrl.getMatches);

// GET /matches/:id
router.get('/matches/:id', ctrl.getMatch);

export default router;
