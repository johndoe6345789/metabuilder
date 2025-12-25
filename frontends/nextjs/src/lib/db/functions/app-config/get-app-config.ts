/**
 * Get App Config
 * Retrieves the application configuration from database
 */

import { prisma } from '../../prisma'
import type { AppConfiguration } from '../../../types/level-types'

/**
 * Get the application configuration
 * @returns AppConfiguration or null if not found
 */
export const getAppConfig = async (): Promise<AppConfiguration | null> => {
  const config = await prisma.appConfiguration.findFirst()
  if (!config) return null

  return {
    id: config.id,
    name: config.name,
    schemas: JSON.parse(config.schemas),
    workflows: JSON.parse(config.workflows),
    luaScripts: JSON.parse(config.luaScripts),
    pages: JSON.parse(config.pages),
    theme: JSON.parse(config.theme),
  }
}
