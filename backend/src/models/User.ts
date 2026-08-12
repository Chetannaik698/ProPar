/**
 * User Model
 *
 * Stores user accounts for authentication.
 * Supports multiple auth providers (Google, Apple, Microsoft, Email magic-link).
 *
 * @module models/User
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * Auth provider types
 */
export type AuthProvider = 'google' | 'apple' | 'microsoft' | 'email';

/**
 * User document interface
 */
export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: Date;
  avatarUrl?: string;
  provider: AuthProvider;
  providerId?: string;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
      select: false,
    },
    verificationTokenExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      required: true,
      enum: ['google', 'apple', 'microsoft', 'email'],
      default: 'email',
    },
    providerId: {
      type: String,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound index for provider lookups
 */
userSchema.index({ provider: 1, providerId: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
