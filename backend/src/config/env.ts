/**
 * Environment variable loader and validator
 *
 * This module loads environment variables from .env file and validates them.
 * Uses Zod for runtime type checking and validation.
 *
 * @module config/env
 */

import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load environment variables from .env file
// This must be called before accessing process.env
const configDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(configDir, '../../.env') });

/**
 * Environment variable schema
 * Defines all required and optional environment variables with their types and validation rules
 */
const envSchema = z.object({
  // Server configuration
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'PORT must be a positive integer'),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Database configuration. Optional for the current analysis-only API path.
  MONGODB_URI: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().url('MONGODB_URI must be a valid URL').optional()
  ),

  // AI provider configuration
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default('openai/gpt-4o-mini'),
  OPENROUTER_FALLBACK_MODELS: z.string().default(''),

  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),

  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),

  PRIMARY_AI_PROVIDER: z.enum(['gemini', 'groq', 'openrouter']).default('gemini'),
  FALLBACK_AI_PROVIDER: z.enum(['groq', 'gemini', 'openrouter', 'none']).default('groq'),

  AI_REQUEST_TIMEOUT_MS: z
    .string()
    .default('30000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 5_000, 'AI_REQUEST_TIMEOUT_MS must be at least 5000'),
  AI_MAX_COMPLETION_TOKENS: z
    .string()
    .default('3500')
    .transform((val) => parseInt(val, 10))
    .refine(
      (val) => !isNaN(val) && val >= 1000 && val <= 4000,
      'AI_MAX_COMPLETION_TOKENS must be between 1000 and 4000'
    ),

  // ============================================
  // Authentication Configuration
  // ============================================

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Frontend URL for redirects & magic-link emails
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Apple OAuth (optional)
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),

  // Microsoft OAuth (optional)
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),

  // SMTP for magic-link emails (optional — falls back to console in dev)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number().int().positive().optional()
  ),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

/**
 * Validated environment variables type
 * This is the inferred type from the Zod schema
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 * This object contains all environment variables after validation
 * @throws {ZodError} If environment variables fail validation
 */
export const env: Env = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter((err) => err.code === 'invalid_type' && err.expected === 'string')
        .map((err) => err.path.join('.'));

      const invalidVars = error.errors
        .filter((err) => err.code !== 'invalid_type' || err.expected !== 'string')
        .map((err) => `${err.path.join('.')}: ${err.message}`);

      let errorMessage = 'Environment validation failed:\n';

      if (missingVars.length > 0) {
        errorMessage += `\nMissing required variables:\n${missingVars.map((v) => `  - ${v}`).join('\n')}`;
      }

      if (invalidVars.length > 0) {
        errorMessage += `\nInvalid variables:\n${invalidVars.map((v) => `  - ${v}`).join('\n')}`;
      }

      throw new Error(errorMessage);
    }
    throw error;
  }
})();

/**
 * Check if the application is running in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if the application is running in production mode
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if the application is running in test mode
 */
export const isTest = env.NODE_ENV === 'test';
