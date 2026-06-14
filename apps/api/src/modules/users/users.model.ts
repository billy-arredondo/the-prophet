import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { AuthProvider } from '@the-prophet/shared';

export interface IUserDocument extends Document<string | Types.ObjectId> {
  /**
   * _id is the Better Auth user id (a UUID string for Google users).
   * For managed members created in-app it is a Mongoose ObjectId.
   */
  _id: string | Types.ObjectId;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  provider: AuthProvider;
  managedBy: Types.ObjectId | null;
  isSuperAdmin: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    // Allow both string UUIDs (Better Auth) and ObjectIds (managed members)
    _id: { type: Schema.Types.Mixed },
    displayName: { type: String, required: true, trim: true, maxlength: 40 },
    email: { type: String, default: null, lowercase: true },
    photoURL: { type: String, default: null },
    provider: { type: String, enum: ['google', 'guest'], required: true },
    managedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isSuperAdmin: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ managedBy: 1 });

const UserModel = mongoose.model<IUserDocument>('User', userSchema);
export default UserModel;
