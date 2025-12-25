import { prisma } from '../prisma'
import type { AppConfiguration } from '../../level-types'

export async function setAppConfig(config: AppConfiguration): Promise<void> {
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
