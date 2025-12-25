/**
 * Seed Data Module
 * 
 * Initializes the database with seed data including:
 * - Default users at each permission level
 * - Initial configuration
 * - Package metadata
 * - System templates
 * 
 * This runs once during application initialization
 */

import { initializeAllSeedData } from '@/seed-data'

/**
 * Seeds the database with initial data
 * 
 * This function should be called during app initialization
 * to populate the database with default users, configurations,
 * and system data needed for the application to function.
 * 
 * @async
 * @returns {Promise<void>}
 */
export async function seedDatabase() {
  await initializeAllSeedData()
}
