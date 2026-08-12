/**
 * MagicToken Model
 *
 * Stores one-time-use tokens for email magic-link authentication.
 * Tokens auto-expire after 15 minutes via MongoDB TTL index.
 *
 * @module models/MagicToken
 */

import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'node:crypto';

/**
 * MagicToken document interface
 */
export interface IMagicToken extends Document {
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}

const magicTokenSchema = new Schema<IMagicToken>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL — auto-delete expired docs
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Generate a cryptographically secure magic-link token
 */
export const generateMagicToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const MagicToken = mongoose.model<IMagicToken>('MagicToken', magicTokenSchema);
