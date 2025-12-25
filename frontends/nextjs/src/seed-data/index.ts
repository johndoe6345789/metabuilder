export * from './pages'
export * from './components'
export * from './workflows'
export * from './scripts'
export * from './users'
export * from './packages'

import { initializePages } from './pages'
import { initializeComponents } from './components'
import { initializeWorkflows } from './workflows'
import { initializeScripts } from './scripts'
import { initializeUsers } from './users'
import { initializePackages } from './packages'

export async function initializeAllSeedData() {
  await initializeUsers()
  await initializeComponents()
  await initializeScripts()
  await initializeWorkflows()
  await initializePages()
  await initializePackages()
}
