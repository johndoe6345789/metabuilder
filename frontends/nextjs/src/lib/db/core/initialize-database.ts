import { prisma } from '../../config/prisma'

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Prisma client typing is generated; suppress lint in environments without generated types.
     
    await prisma.$connect()
    // Database initialized successfully
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}
