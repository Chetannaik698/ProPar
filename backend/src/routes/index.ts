/**
 * Route definitions
 *
 * This file aggregates all API routes for the application.
 * Each feature should have its own route file that is imported and mounted here.
 *
 * @module routes
 */

import { Router } from 'express';
import { env } from '../config/env.js';
import { getDBInfo } from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { analysisRoutes } from './analysis.routes.js';
import { authRoutes } from './auth.routes.js';

/**
 * Create API router
 *
 * All API routes should be defined here or imported and mounted on this router.
 *
 * @returns {Router} Express router with all routes
 */
export const createRoutes = (): Router => {
  const router = Router();

  // ============================================
  // Analysis Routes
  // ============================================
  router.use('/api/v1', analysisRoutes);

  // ============================================
  // Authentication Routes
  // ============================================
  router.use('/api/v1/auth', authRoutes);

  // ============================================
  // Health Check Routes
  // ============================================

  /**
   * GET /
   * Root endpoint - API information
   *
   * @returns {Object} API name, version, and status
   */
  router.get('/', (_req, res) => {
    res.json({
      name: 'ProPar API',
      version: '1.0.0',
      status: 'running',
    });
  });

  /**
   * GET /health
   * Health check endpoint - Server and database status
   *
   * @returns {Object} Server status, database status, and uptime
   */
  router.get('/health', asyncHandler(async (_req, res) => {
    // Get database info
    const dbInfo = getDBInfo();

    // Calculate uptime
    const uptime = process.uptime();
    const uptimeFormatted = formatUptime(uptime);

    res.json({
      status: 'ok',
      server: 'running',
      database: dbInfo.status,
      uptime: uptimeFormatted,
      details: {
        database: dbInfo,
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
    });
  }));

  // ============================================
  // Future Routes
  // ============================================

  // Example of how to mount feature routes:
  // router.use('/users', userRoutes);
  // router.use('/prompts', promptRoutes);
  // router.use('/auth', authRoutes);

  return router;
};

/**
 * Format uptime seconds into human-readable format
 *
 * @param seconds - Uptime in seconds
 * @returns Formatted uptime string
 */
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
};

// Export router directly for convenience
export const apiRouter = createRoutes();