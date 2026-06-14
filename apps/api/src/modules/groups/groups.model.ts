import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { GroupVisibility } from '@the-prophet/shared';

export interface IGroupDocument extends Document {
  name: string;
  description: string;
  tournamentId: Types.ObjectId;
  createdBy: Types.ObjectId;
  adminIds: Types.ObjectId[];
  memberIds: Types.ObjectId[];
  inviteCode: string;
  visibility: GroupVisibility;
  createdAt: Date;
}

const groupSchema = new Schema<IGroupDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, default: '', trim: true, maxlength: 280 },
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    adminIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    memberIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    inviteCode: { type: String, required: true, unique: true },
    visibility: { type: String, enum: ['private', 'public'], default: 'private' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// inviteCode already has a unique index from `unique: true` on the field.
// All groups a user is a member of
groupSchema.index({ memberIds: 1 });
// All groups a user administers
groupSchema.index({ adminIds: 1 });

const GroupModel = mongoose.model<IGroupDocument>('Group', groupSchema);
export default GroupModel;
