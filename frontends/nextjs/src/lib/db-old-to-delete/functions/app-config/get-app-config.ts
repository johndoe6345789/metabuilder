/**
 * Get App Config
 * Retrieves the application configuration from database
 */

import type { AppConfiguration } from '@/lib/types/level-types'
import { prisma } from '@/lib/config/prisma'

/**
 * Get the application configuration
 * @returns AppConfiguration or null if not found
 */
export const getAppConfig = async (): Promise<AppConfiguration | null> => {
  const config = await (prisma as any).appConfiguration.findFirst()
  if (!config) return null

  return {
    id: config.id,
    name: config.name,
    schemas: JSON.parse(config.schemas),
    workflows: JSON.parse(config.workflows),
    pages: JSON.parse(config.pages),
    theme: JSON.parse(config.theme),
  }
}
