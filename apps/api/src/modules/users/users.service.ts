/**
 * Users service — profile management and managed-member operations.
 */
import mongoose from 'mongoose';
import type { UpdateProfileInput, CreateManagedMemberInput } from '@the-prophet/shared';
import { INVITE_CODE_ALPHABET } from '@the-prophet/shared';
import UserModel, { type IUserDocument } from './users.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { env } from '../../config/env.js';

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

/** Generates a short random token for managed-member access links */
function generateAccessToken(): string {
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += INVITE_CODE_ALPHABET[Math.floor(Math.random() * INVITE_CODE_ALPHABET.length)];
  }
  return token;
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
 * Generate a short-lived access link token for a managed member.
 * The token encodes the member id; sign with DEVICE_TOKEN_SECRET.
 * TODO: replace with a proper JWT signed with env.DEVICE_TOKEN_SECRET.
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

  // TODO: sign a JWT with { sub: memberId, iat, exp } using env.DEVICE_TOKEN_SECRET
  const token = generateAccessToken();
  const url = `${env.WEB_ORIGIN}/join?token=${token}&uid=${memberId}`;

  return { url, token };
}

/** Return all managed members for an admin. */
export async function getManagedMembers(adminId: string): Promise<IUserDocument[]> {
  return UserModel.find({ managedBy: new mongoose.Types.ObjectId(adminId) });
}

