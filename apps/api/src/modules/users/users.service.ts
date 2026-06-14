/**
 * Users service — profile management and managed-member operations.
 */
import mongoose from 'mongoose';
import type { UpdateProfileInput, CreateManagedMemberInput } from '@the-prophet/shared';
import UserModel, { type IUserDocument } from './users.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { env } from '../../config/env.js';
import { signDeviceToken } from '../../lib/deviceToken.js';

export async function getProfile(userId: string): Promise<IUserDocument> {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');
  return user;
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<IUserDocument> {
  const user = await UserModel.findByIdAndUpdate(userId, { $set: input }, { new: true });
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');
  return user;
}

/**
 * Create a managed (guest) member on behalf of an admin user.
 * The admin must be Google-authenticated (enforced at route level).
 */
export async function createManagedMember(
  adminId: string,
  input: CreateManagedMemberInput,
): Promise<IUserDocument> {
  // Managed members count against the admin's group admin cap — not checked here
  // but worth noting for future enforcement.

  const member = await UserModel.create({
    // _id is Mixed and Mongoose neither auto-generates nor casts it on queries.
    // Store a string id (like Better Auth users) so string lookups — findById,
    // access-link, device redeem — match. (A raw ObjectId would not match the
    // string id sent from the client.)
    _id: new mongoose.Types.ObjectId().toString(),
    displayName: input.displayName,
    email: null,
    photoURL: null,
    provider: 'guest',
    managedBy: new mongoose.Types.ObjectId(adminId),
    isSuperAdmin: false,
  });

  return member;
}

/**
 * Generate an access link for a managed member: a JWT device token signed with
 * DEVICE_TOKEN_SECRET (the member id is embedded in the token). The device
 * redeems it at POST /api/device/session — see lib/deviceToken.ts.
 */
export async function generateManagedMemberAccessLink(
  adminId: string,
  memberId: string,
): Promise<{ url: string; token: string }> {
  const member = await UserModel.findOne({
    _id: memberId,
    managedBy: new mongoose.Types.ObjectId(adminId),
  });

  if (!member) {
    throw new AppError(404, 'Managed member not found or not owned by you', 'NOT_FOUND');
  }

  const token = signDeviceToken(String(member._id));
  const url = `${env.WEB_ORIGIN}/join?token=${encodeURIComponent(token)}`;

  return { url, token };
}

/** Return all managed members for an admin. */
export async function getManagedMembers(adminId: string): Promise<IUserDocument[]> {
  return UserModel.find({ managedBy: new mongoose.Types.ObjectId(adminId) });
}

