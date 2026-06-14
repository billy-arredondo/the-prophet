/**
 * requireGroupAdmin middleware.
 * Must run AFTER requireAuth.
 * Verifies the authenticated user is an admin (or creator) of the group
 * identified by req.params.id (groupId).
 */
import type { Request, Response, NextFunction } from 'express';
import GroupModel from '../modules/groups/groups.model.js';

export async function requireGroupAdmin(
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
    const isAdmin =
      group.adminIds.map(String).includes(userId) || String(group.createdBy) === userId;

    if (!isAdmin) {
      res.status(403).json({
        error: { code: 'NOT_ADMIN', message: 'Group admin privileges required' },
      });
      return;
    }

    next();
  } catch (err) {
    console.error('[requireGroupAdmin]', err);
    next(err);
  }
}
