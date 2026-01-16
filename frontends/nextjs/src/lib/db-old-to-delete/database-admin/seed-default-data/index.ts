import { seedAppConfig } from './app/seed-app-config'
import { seedHomePage } from './app/seed-home-page'
import { seedCssCategories } from './css/seed-css-categories'
import { seedDropdownConfigs } from './dropdowns/seed-dropdown-configs'
import { seedUsers } from './users/seed-users'

/**
 * Seed database with default data
 */
export const seedDefaultData = async (): Promise<void> => {
  await seedUsers()
  await seedAppConfig()
  await seedHomePage()
  await seedCssCategories()
  await seedDropdownConfigs()
}

export const defaultDataBuilders = {
  seedUsers,
  seedAppConfig,
  seedHomePage,
  seedCssCategories,
  seedDropdownConfigs,
}
