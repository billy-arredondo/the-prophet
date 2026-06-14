import type { Request, Response, NextFunction } from 'express';
import * as usersService from './users.service.js';

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await usersService.getProfile(String(req.user!._id));
    res.json(user.toJSON());
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await usersService.updateProfile(String(req.user!._id), req.body);
    res.json(user.toJSON());
  } catch (err) {
    next(err);
  }
}

export async function createManagedMember(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const member = await usersService.createManagedMember(String(req.user!._id), req.body);
    res.status(201).json(member.toJSON());
  } catch (err) {
    next(err);
  }
}

export async function listManagedMembers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const members = await usersService.getManagedMembers(String(req.user!._id));
    res.json(members.map((m) => m.toJSON()));
  } catch (err) {
    next(err);
  }
}

export async function getManagedMemberAccessLink(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await usersService.generateManagedMemberAccessLink(
      String(req.user!._id),
      req.params['id']!,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}
