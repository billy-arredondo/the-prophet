import { Router } from 'express';
import { updateProfileSchema, createManagedMemberSchema } from '@the-prophet/shared';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireGoogleAuth } from '../../middleware/requireGoogleAuth.js';
import { validate } from '../../middleware/validate.js';
import * as ctrl from './users.controller.js';

const router = Router();

// All user routes require auth
router.use(requireAuth);

// GET  /me
router.get('/me', ctrl.getMe);

// PATCH /me
router.patch('/me', validate(updateProfileSchema), ctrl.updateMe);

// GET  /me/managed-members
router.get('/me/managed-members', requireGoogleAuth, ctrl.listManagedMembers);

// POST /me/managed-members  — Google-authenticated admins only
router.post(
  '/me/managed-members',
  requireGoogleAuth,
  validate(createManagedMemberSchema),
  ctrl.createManagedMember,
);

// POST /managed-members/:id/access-link
router.post(
  '/managed-members/:id/access-link',
  requireGoogleAuth,
  ctrl.getManagedMemberAccessLink,
);

export default router;
