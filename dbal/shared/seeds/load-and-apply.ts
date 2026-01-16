/**
 * @file seeds/load-and-apply.ts
 * @description Seed script entry point
 *
 * Loads and applies seed data from /dbal/shared/seeds/ folder.
 * Run via: npm --prefix dbal/development run db:seed
 */

// Load environment variables first
import 'dotenv/config'

import { getDBALClient, seedDatabase } from '../../../dbal/development/dist/index.js'

async function main() {
  try {
    console.log('📦 Loading seed data...')
    const client = getDBALClient()
    await seedDatabase(client)
    console.log('✅ Database seeded successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
