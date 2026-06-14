/**
 * Groups service — group CRUD, membership, invite codes.
 *
 * Core logic implemented here:
 * - Invite code generation (unique, retry on collision)
 * - 10-group admin cap check
 * - Last-admin guard (can't leave/remove if sole admin)
 */
import mongoose from 'mongoose';
import type { CreateGroupInput, UpdateGroupInput, JoinGroupInput } from '@the-prophet/shared';
import { INVITE_CODE_ALPHABET, INVITE_CODE_LENGTH } from '@the-prophet/shared';
import GroupModel, { type IGroupDocument } from './groups.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { env } from '../../config/env.js';

// ── Invite code ──────────────────────────────────────────────────────────────

function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    const idx = Math.floor(Math.random() * INVITE_CODE_ALPHABET.length);
    code += INVITE_CODE_ALPHABET[idx];
  }
  return code;
}

/** Generate a unique invite code, retrying on collision (max 5 attempts). */
async function uniqueInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateInviteCode();
    const exists = await GroupModel.exists({ inviteCode: code });
    if (!exists) return code;
  }
  throw new AppError(500, 'Could not generate unique invite code', 'INVITE_CODE_ERROR');
}

// ── Group cap ────────────────────────────────────────────────────────────────

const maxGroups = () => env.MAX_GROUPS_PER_ADMIN;

async function assertAdminCapNotReached(userId: string): Promise<void> {
  const count = await GroupModel.countDocuments({
    adminIds: new mongoose.Types.ObjectId(userId),
  });
  if (count >= maxGroups()) {
    throw new AppError(
      422,
      `You can administrate at most ${maxGroups()} groups`,
      'ADMIN_CAP_REACHED',
    );
  }
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function createGroup(
  userId: string,
  input: CreateGroupInput,
): Promise<IGroupDocument> {
  await assertAdminCapNotReached(userId);

  const inviteCode = await uniqueInviteCode();
  const uid = new mongoose.Types.ObjectId(userId);

  const group = await GroupModel.create({
    name: input.name,
    description: input.description ?? '',
    tournamentId: new mongoose.Types.ObjectId(input.tournamentId),
    createdBy: uid,
    adminIds: [uid],
    memberIds: [uid],
    inviteCode,
    visibility: 'private',
  });

  return group;
}

export async function getGroupsForUser(userId: string): Promise<IGroupDocument[]> {
  return GroupModel.find({ memberIds: new mongoose.Types.ObjectId(userId) });
}

export async function getGroupById(groupId: string): Promise<IGroupDocument> {
  const group = await GroupModel.findById(groupId);
  if (!group) throw new AppError(404, 'Group not found', 'NOT_FOUND');
  return group;
}

export async function updateGroup(
  groupId: string,
  input: UpdateGroupInput,
): Promise<IGroupDocument> {
  const group = await GroupModel.findByIdAndUpdate(groupId, { $set: input }, { new: true });
  if (!group) throw new AppError(404, 'Group not found', 'NOT_FOUND');
  return group;
}

export async function deleteGroup(groupId: string): Promise<void> {
  await GroupModel.findByIdAndDelete(groupId);
  // TODO: cascade — delete rankings for this group
}

// ── Invite code rotation ─────────────────────────────────────────────────────

export async function rotateInviteCode(groupId: string): Promise<IGroupDocument> {
  const code = await uniqueInviteCode();
  const group = await GroupModel.findByIdAndUpdate(
    groupId,
    { $set: { inviteCode: code } },
    { new: true },
  );
  if (!group) throw new AppError(404, 'Group not found', 'NOT_FOUND');
  return group;
}

// ── Join / leave / remove ────────────────────────────────────────────────────

export async function joinGroup(userId: string, input: JoinGroupInput): Promise<IGroupDocument> {
  const group = await GroupModel.findOne({ inviteCode: input.inviteCode.toUpperCase() });
  if (!group) throw new AppError(404, 'Invalid invite code', 'INVALID_INVITE');

  const uid = new mongoose.Types.ObjectId(userId);
  const alreadyMember = group.memberIds.some((id) => id.equals(uid));
  if (alreadyMember) return group; // idempotent

  group.memberIds.push(uid);
  await group.save();
  return group;
}

export async function leaveGroup(groupId: string, userId: string): Promise<void> {
  const group = await GroupModel.findById(groupId);
  if (!group) throw new AppError(404, 'Group not found', 'NOT_FOUND');

  const uid = new mongoose.Types.ObjectId(userId);

  // Last-admin guard: prevent leaving if sole admin
  const isAdmin = group.adminIds.some((id) => id.equals(uid));
  if (isAdmin && group.adminIds.length === 1) {
    throw new AppError(
      422,
      'You are the only admin — transfer admin rights before leaving',
      'LAST_ADMIN',
    );
  }

  group.memberIds = group.memberIds.filter((id) => !id.equals(uid));
  group.adminIds = group.adminIds.filter((id) => !id.equals(uid));
  await group.save();
}

export async function removeMember(
  groupId: string,
  targetUserId: string,
  requestingUserId: string,
): Promise<void> {
  const group = await GroupModel.findById(groupId);
  if (!group) throw new AppError(404, 'Group not found', 'NOT_FOUND');

  const targetUid = new mongoose.Types.ObjectId(targetUserId);

  // Last-admin guard: can't remove the only admin
  const isAdmin = group.adminIds.some((id) => id.equals(targetUid));
  if (isAdmin && group.adminIds.length === 1) {
    throw new AppError(422, 'Cannot remove the sole admin of a group', 'LAST_ADMIN');
  }

  // Cannot remove the creator
  if (group.createdBy.equals(targetUid)) {
    throw new AppError(422, 'Cannot remove the group creator', 'CANNOT_REMOVE_CREATOR');
  }

  void requestingUserId; // already validated by requireGroupAdmin middleware

  group.memberIds = group.memberIds.filter((id) => !id.equals(targetUid));
  group.adminIds = group.adminIds.filter((id) => !id.equals(targetUid));
  await group.save();
}

// ── Admin promotion ───────────────────────────────────────────────────────────

export async function promoteToAdmin(
  groupId: string,
  targetUserId: string,
): Promise<IGroupDocument> {
  const group = await GroupModel.findById(groupId);
  if (!group) throw new AppError(404, 'Group not found', 'NOT_FOUND');

  const targetUid = new mongoose.Types.ObjectId(targetUserId);
  const isMember = group.memberIds.some((id) => id.equals(targetUid));
  if (!isMember) throw new AppError(422, 'User is not a member of this group', 'NOT_MEMBER');

  const alreadyAdmin = group.adminIds.some((id) => id.equals(targetUid));
  if (!alreadyAdmin) {
    group.adminIds.push(targetUid);
    await group.save();
  }

  return group;
}
