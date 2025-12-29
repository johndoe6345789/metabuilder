export * from './entities/content/pages'
export * from './entities/content/power-transfers'
export * from './entities/content/scripts'
export * from './entities/content/workflows'
export * from './entities/core/components'
export * from './entities/core/packages'
export * from './entities/core/users'

import { initializePages } from './entities/content/pages'
import { initializePowerTransfers } from './entities/content/power-transfers'
import { initializeScripts } from './entities/content/scripts'
import { initializeWorkflows } from './entities/content/workflows'
import { initializeComponents } from './entities/core/components'
import { initializePackages } from './entities/core/packages'
import { initializeUsers } from './entities/core/users'

export async function initializeAllSeedData() {
  await initializeUsers()
  await initializeComponents()
  await initializeScripts()
  await initializeWorkflows()
  await initializePages()
  await initializePackages()
  await initializePowerTransfers()
}
