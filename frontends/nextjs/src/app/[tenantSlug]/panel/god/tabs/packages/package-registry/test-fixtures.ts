import type { RegistryPackage } from './types'

/** A minimal-but-complete draft package, for tests that need a real
 *  RegistryPackage shape without caring about most of its fields. */
export function testPackage(
  over: Partial<RegistryPackage> = {}
): RegistryPackage {
  return {
    manifest: {
      id: 'p1',
      name: 'Forum',
      version: '1.0.0',
      description: '',
      author: 'you',
      category: 'other',
      icon: 'forum',
      screenshots: [],
      tags: [],
      dependencies: [],
      createdAt: 1,
      updatedAt: 1,
      downloadCount: 0,
      rating: 0,
      installed: false,
    },
    content: {
      schemas: [],
      pages: [],
      workflows: [],
      componentHierarchy: {},
      componentConfigs: {},
      cssClasses: [],
      dropdownConfigs: [],
    },
    archived: false,
    workflows: [],
    pageConfigs: [],
    themeId: null,
    publishedId: null,
    ...over,
  }
}
