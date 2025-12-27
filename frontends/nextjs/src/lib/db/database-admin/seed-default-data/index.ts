import { seedAppConfig } from './app/seed-app-config'
import { seedUsers } from './app/seed-users'
import { seedCssCategories } from './css/seed-css-categories'
import { seedDropdownConfigs } from './dropdowns/seed-dropdown-configs'

/**
 * Seed database with default data
 */
export const seedDefaultData = async (): Promise<void> => {
  await seedUsers()
  await seedAppConfig()
  await seedCssCategories()
  await seedDropdownConfigs()
}

export const defaultDataBuilders = {
  seedUsers,
  seedAppConfig,
  seedCssCategories,
  seedDropdownConfigs,
}
