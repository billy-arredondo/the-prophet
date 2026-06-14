/**
 * requireGroupMember middleware.
 * Must run AFTER requireAuth.
 * Verifies the authenticated user is a member (or admin) of the group
 * identified by req.params.id (groupId).
 */
import type { Request, Response, NextFunction } from 'express';
import GroupModel from '../modules/groups/groups.model.js';

export async function requireGroupMember(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }

  try {
    const groupId = req.params['id'];
    const group = await GroupModel.findById(groupId).lean();

    if (!group) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Group not found' } });
      return;
    }

    const userId = String(req.user._id);
    const isMember =
      group.memberIds.map(String).includes(userId) ||
      group.adminIds.map(String).includes(userId) ||
      String(group.createdBy) === userId;

    if (!isMember) {
      res.status(403).json({
        error: { code: 'NOT_MEMBER', message: 'You are not a member of this group' },
      });
      return;
    }

    next();
  } catch (err) {
    console.error('[requireGroupMember]', err);
    next(err);
  }
}
