/**
 * MongoDB connection utility
 *
 * This module handles the connection to MongoDB using Mongoose.
 * It provides a graceful connection management that won't crash the server
 * if the database is unavailable.
 *
 * @module config/db
 */

import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Connection state tracking
 */
let isConnected = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 5;

/**
 * Establishes connection to MongoDB
 *
 * This function attempts to connect to MongoDB and handles connection events.
 * It will not crash the server if the database is unavailable.
 *
 * @returns {Promise<boolean>} True if connected, false otherwise
 * @throws {Error} If maximum connection attempts are reached
 */
export const connectDB = async (): Promise<boolean> => {
  if (!env.MONGODB_URI) {
    console.info('MongoDB connection skipped because MONGODB_URI is not configured.');
    return false;
  }

  // If already connected, return true
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  // Check if we've exceeded max attempts
  if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
    console.error(
      `❌ Failed to connect to MongoDB after ${MAX_CONNECTION_ATTEMPTS} attempts. ` +
        'Please check your MONGODB_URI and ensure MongoDB is running.'
    );
    return false;
  }

  try {
    connectionAttempts++;

    console.log(`🔄 Attempting to connect to MongoDB (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})...`);

    // Set mongoose options for better connection handling
    // Note: Recent MongoDB driver versions do not support `keepAlive`/`keepalive` here.
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI, options);

    isConnected = true;
    connectionAttempts = 0; // Reset attempts on successful connection

    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
      isConnected = false;
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📦 MongoDB connection closed due to application termination');
      process.exit(0);
    });

    return true;
  } catch (error) {
    isConnected = false;
    console.error(
      `❌ MongoDB connection attempt ${connectionAttempts} failed: ` +
        (error instanceof Error ? error.message : 'Unknown error')
    );
    console.warn('⚠️  Server will continue running without database connection');
    console.warn('   Some features may not work until database is available');
    return false;
  }
};

/**
 * Check if MongoDB is currently connected
 *
 * @returns {boolean} True if connected, false otherwise
 */
export const isDBConnected = (): boolean => {
  return isConnected && mongoose.connection.readyState === 1;
};

/**
 * Get MongoDB connection state
 *
 * @returns {number} Connection state (0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting)
 */
export const getDBState = (): number => {
  return mongoose.connection.readyState;
};

/**
 * Get database connection info for health checks
 *
 * @returns {Object} Connection information
 */
export const getDBInfo = () => {
  const state = getDBState();
  let status: 'connected' | 'disconnected' | 'connecting' | 'disconnecting';

  switch (state) {
    case 0:
      status = 'disconnected';
      break;
    case 1:
      status = 'connected';
      break;
    case 2:
      status = 'connecting';
      break;
    case 3:
      status = 'disconnecting';
      break;
    default:
      status = 'disconnected';
  }

  return {
    status,
    database: mongoose.connection.name || 'N/A',
    host: mongoose.connection.host || 'N/A',
    attempts: connectionAttempts,
  };
};

/**
 * Disconnect from MongoDB
 *
 * @returns {Promise<void>}
 */
export const disconnectDB = async (): Promise<void> => {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('📦 MongoDB disconnected');
  }
};