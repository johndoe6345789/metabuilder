import { seedAppConfig } from './app/seed-app-config'
import { seedCssCategories } from './css/seed-css-categories'
import { seedDropdownConfigs } from './dropdowns/seed-dropdown-configs'

/**
 * Seed database with default data
 */
export const seedDefaultData = async (): Promise<void> => {
  // TODO: Implement seedUsers function and import it
  // await seedUsers()
  await seedAppConfig()
  await seedCssCategories()
  await seedDropdownConfigs()
}

export const defaultDataBuilders = {
  // seedUsers,
  seedAppConfig,
  seedCssCategories,
  seedDropdownConfigs,
}
