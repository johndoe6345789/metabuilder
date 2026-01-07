import type { AppConfiguration } from '@/lib/types/level-types'

export const buildDefaultAppConfig = (): AppConfiguration => ({
  id: 'app_001',
  name: 'MetaBuilder App',
  schemas: [],
  workflows: [],
  pages: [],
  theme: {
    colors: {},
    fonts: {},
  },
})
