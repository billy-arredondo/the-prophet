import { Router } from 'express';
import { createGroupSchema, updateGroupSchema, joinGroupSchema } from '@the-prophet/shared';
import { requireAuth } from '../../middleware/requireAuth.js';
import { requireGoogleAuth } from '../../middleware/requireGoogleAuth.js';
import { requireGroupMember } from '../../middleware/requireGroupMember.js';
import { requireGroupAdmin } from '../../middleware/requireGroupAdmin.js';
import { validate } from '../../middleware/validate.js';
import * as ctrl from './groups.controller.js';

const router = Router();

// All group routes require authentication
router.use(requireAuth);

// POST /groups — create group (Google auth required + admin cap enforced in service)
router.post('/groups', requireGoogleAuth, validate(createGroupSchema), ctrl.createGroup);

// GET /groups — list groups the current user is a member of
router.get('/groups', ctrl.listGroups);

// POST /groups/join — join via invite code (any authenticated user)
router.post('/groups/join', validate(joinGroupSchema), ctrl.joinGroup);

// ── Routes that need a specific group ────────────────────────────────────────

// GET /groups/:id — read group (member only)
router.get('/groups/:id', requireGroupMember, ctrl.getGroup);

// PATCH /groups/:id — update group metadata (admin only)
router.patch('/groups/:id', requireGroupAdmin, requireGoogleAuth, validate(updateGroupSchema), ctrl.updateGroup);

// DELETE /groups/:id — delete group (admin only, Google auth)
router.delete('/groups/:id', requireGroupAdmin, requireGoogleAuth, ctrl.deleteGroup);

// POST /groups/:id/invite — rotate invite code (admin only)
router.post('/groups/:id/invite', requireGroupAdmin, requireGoogleAuth, ctrl.rotateInviteCode);

// DELETE /groups/:id/members/:uid — remove a member (admin only)
router.delete(
  '/groups/:id/members/:uid',
  requireGroupAdmin,
  requireGoogleAuth,
  ctrl.removeMember,
);

// POST /groups/:id/admins/:uid — promote member to admin (admin only)
router.post(
  '/groups/:id/admins/:uid',
  requireGroupAdmin,
  requireGoogleAuth,
  ctrl.promoteToAdmin,
);

// POST /groups/:id/leave — leave a group (any member)
router.post('/groups/:id/leave', requireGroupMember, ctrl.leaveGroup);

export default router;
