export * from './entities/content/pages'
export * from './entities/core/components'
export * from './entities/content/workflows'
export * from './entities/content/scripts'
export * from './entities/core/users'
export * from './entities/core/packages'
export * from './entities/content/power-transfers'

import { initializePages } from './entities/content/pages'
import { initializeComponents } from './entities/core/components'
import { initializeWorkflows } from './entities/content/workflows'
import { initializeScripts } from './entities/content/scripts'
import { initializeUsers } from './entities/core/users'
import { initializePackages } from './entities/core/packages'
import { initializePowerTransfers } from './entities/content/power-transfers'

export async function initializeAllSeedData() {
  await initializeUsers()
  await initializeComponents()
  await initializeScripts()
  await initializeWorkflows()
  await initializePages()
  await initializePackages()
  await initializePowerTransfers()
}
