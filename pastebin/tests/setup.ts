/**
 * Jest Setup File
 * Configuration and global test utilities
 */

import { logger } from '../src/lib/quality-validator/utils/logger.js';

// Suppress verbose logging during tests
logger.configure({ verbose: false, useColors: false });

// Set test timeout
jest.setTimeout(10000);

// Mock environment
process.env.NODE_ENV = 'test';
