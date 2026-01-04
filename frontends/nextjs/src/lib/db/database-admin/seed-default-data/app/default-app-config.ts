import type { AppConfiguration } from '@/lib/level-types'

export const buildDefaultAppConfig = (): AppConfiguration => ({
  id: 'app_001',
  name: 'MetaBuilder App',
  schemas: [],
  workflows: [],
  luaScripts: [],
  pages: [],
  theme: {
    colors: {},
    fonts: {},
  },
})
