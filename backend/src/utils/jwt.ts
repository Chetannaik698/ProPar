/**
 * JWT Utility
 *
 * Sign and verify JSON Web Tokens for user authentication.
 *
 * @module utils/jwt
 */

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * JWT payload interface
 */
export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Parse a duration string like "7d", "24h", "30m" into seconds.
 */
const parseDuration = (duration: string): number => {
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) return 604800; // Default: 7 days in seconds

  const numStr = match[1];
  const unit = match[2];
  if (!numStr || !unit) return 604800;

  const value = parseInt(numStr, 10);
  switch (unit) {
    case 'd': return value * 86400;
    case 'h': return value * 3600;
    case 'm': return value * 60;
    case 's': return value;
    default: return 604800;
  }
};

/**
 * Sign a JWT for a given user
 *
 * @param userId  - MongoDB user ID
 * @param email   - User email
 * @returns Signed JWT string
 */
export const signToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email } as JwtPayload,
    env.JWT_SECRET as jwt.Secret,
    { expiresIn: parseDuration(env.JWT_EXPIRES_IN) }
  );
};

/**
 * Verify and decode a JWT
 *
 * @param token - JWT string
 * @returns Decoded payload
 * @throws {JsonWebTokenError} If token is invalid or expired
 */
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET as jwt.Secret) as JwtPayload;
};
