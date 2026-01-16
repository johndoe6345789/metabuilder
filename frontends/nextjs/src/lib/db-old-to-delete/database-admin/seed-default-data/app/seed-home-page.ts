import { getAdapter } from '../../../core/dbal-client'

/**
 * Seed the default home page from ui_home package
 */
export const seedHomePage = async (): Promise<void> => {
  const adapter = getAdapter()

  try {
    // Check if home page already exists
    const existingHome = await adapter.list('PageConfig', {
      filter: {
        path: '/',
        isPublished: true,
      },
    }) as { data: unknown[] }

    if (existingHome.data && existingHome.data.length > 0) {
      return // Home page already exists
    }

    // Create home page referencing ui_home package
    await adapter.create('PageConfig', {
      id: `home-${Date.now()}`,
      path: '/',
      title: 'MetaBuilder',
      description: 'Data-driven application platform',
      packageId: 'ui_home',
      component: 'home_page',
      level: 0,
      requiresAuth: false,
      isPublished: true,
      sortOrder: 0,
    })
  } catch (error) {
    console.error('Failed to seed home page:', error)
    // Don't throw - allow application to continue even if seeding fails
  }
}
