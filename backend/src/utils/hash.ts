/**
 * Password Hashing Utility
 *
 * Securely hashes and verifies passwords using PBKDF2.
 * Native Node.js crypto module is used to avoid external binary compilation.
 *
 * @module utils/hash
 */

import crypto from 'node:crypto';

const ITERATIONS = 100000; // Secure standard for PBKDF2 with SHA-512
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

/**
 * Hash a password using PBKDF2
 *
 * @param password - Plaintext password
 * @returns Combined string containing iterations, salt, and hash
 */
export const hashPassword = async (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Generate secure random salt
    const salt = crypto.randomBytes(16).toString('hex');

    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      // Format: iterations:salt:hash
      resolve(`${ITERATIONS}:${salt}:${derivedKey.toString('hex')}`);
    });
  });
};

/**
 * Verify a password against a stored PBKDF2 hash
 *
 * @param password - Plaintext password to verify
 * @param storedHash - Stored hash from the database
 * @returns True if password matches the hash, false otherwise
 */
export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {
      const parts = storedHash.split(':');
      if (parts.length !== 3) {
        return resolve(false); // Invalid hash format
      }

      const iterations = parseInt(parts[0] as string, 10);
      const salt = parts[1] as string;
      const hash = parts[2] as string;

      if (isNaN(iterations) || !salt || !hash) {
        return resolve(false);
      }

      crypto.pbkdf2(password, salt, iterations, KEY_LENGTH, DIGEST, (err, derivedKey) => {
        if (err) return reject(err);
        resolve(derivedKey.toString('hex') === hash);
      });
    } catch (error) {
      reject(error);
    }
  });
};
