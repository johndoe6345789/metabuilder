import { prisma } from '../../config/prisma'

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await prisma.$connect()
    // Database initialized successfully
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}
