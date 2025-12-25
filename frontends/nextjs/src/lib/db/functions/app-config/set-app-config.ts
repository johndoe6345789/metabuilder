/**
 * Set App Config
 * Saves the application configuration to database
 */

import { prisma } from '../../prisma'
import type { AppConfiguration } from '../../../types/level-types'

/**
 * Set the application configuration
 * @param config - The configuration to save
 */
export const setAppConfig = async (config: AppConfiguration): Promise<void> => {
  await prisma.appConfiguration.deleteMany()
  await prisma.appConfiguration.create({
    data: {
      id: config.id,
      name: config.name,
      schemas: JSON.stringify(config.schemas),
      workflows: JSON.stringify(config.workflows),
      luaScripts: JSON.stringify(config.luaScripts),
      pages: JSON.stringify(config.pages),
      theme: JSON.stringify(config.theme),
    },
  })
}
