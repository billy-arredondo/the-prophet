import { Router } from 'express';
import * as ctrl from './device.controller.js';

const router = Router();

// Public: managed-member device sign-in / sign-out (not Better Auth sessions).
// POST /device/session  { token }
router.post('/device/session', ctrl.redeemDevice);

// POST /device/logout
router.post('/device/logout', ctrl.logoutDevice);

export default router;
