import type { Request, Response, NextFunction } from 'express';
import * as groupsService from './groups.service.js';

export async function createGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const group = await groupsService.createGroup(String(req.user!._id), req.body);
    res.status(201).json(group.toJSON());
  } catch (err) {
    next(err);
  }
}

export async function listGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const groups = await groupsService.getGroupsForUser(String(req.user!._id));
    res.json(groups.map((g) => g.toJSON()));
  } catch (err) {
    next(err);
  }
}

export async function getGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const group = await groupsService.getGroupById(req.params['id']!);
    res.json(group.toJSON());
  } catch (err) {
    next(err);
  }
}

export async function updateGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const group = await groupsService.updateGroup(req.params['id']!, req.body);
    res.json(group.toJSON());
  } catch (err) {
    next(err);
  }
}

export async function deleteGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await groupsService.deleteGroup(req.params['id']!);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function rotateInviteCode(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const group = await groupsService.rotateInviteCode(req.params['id']!);
    res.json({ inviteCode: group.inviteCode });
  } catch (err) {
    next(err);
  }
}

export async function joinGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const group = await groupsService.joinGroup(String(req.user!._id), req.body);
    res.json(group.toJSON());
  } catch (err) {
    next(err);
  }
}

export async function removeMember(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await groupsService.removeMember(req.params['id']!, req.params['uid']!, String(req.user!._id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function promoteToAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const group = await groupsService.promoteToAdmin(req.params['id']!, req.params['uid']!);
    res.json(group.toJSON());
  } catch (err) {
    next(err);
  }
}

export async function leaveGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await groupsService.leaveGroup(req.params['id']!, String(req.user!._id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
