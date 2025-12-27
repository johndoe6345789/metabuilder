import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

import { Database } from '@/lib/database'
import type { AppConfiguration } from '@/lib/level-types'
import { seedDatabase } from '@/lib/seed-data'

type ConfigUpdater = (config: AppConfiguration) => AppConfiguration

const createDefaultConfig = (): AppConfiguration => ({
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

const persistConfig = async (config: AppConfiguration, setConfig: (value: AppConfiguration) => void) => {
  setConfig(config)
  await Database.setAppConfig(config)
}

export const useLevel4AppState = () => {
  const [appConfig, setAppConfig] = useState<AppConfiguration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [nerdMode, setNerdMode] = useKV<boolean>('level4-nerd-mode', false)

  useEffect(() => {
    const loadConfig = async () => {
      await seedDatabase()

      const config = await Database.getAppConfig()
      if (config) {
        setAppConfig(config)
      } else {
        const defaultConfig = createDefaultConfig()
        await persistConfig(defaultConfig, setAppConfig)
      }
      setIsLoading(false)
    }

    void loadConfig()
  }, [])

  const updateConfig = useCallback(
    async (updater: ConfigUpdater) => {
      if (!appConfig) return

      const updatedConfig = updater(appConfig)
      await persistConfig(updatedConfig, setAppConfig)
    },
    [appConfig]
  )

  const handleExportConfig = useCallback(async () => {
    const dataStr = await Database.exportDatabase()
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'database-export.json'
    link.click()
    toast.success('Database exported')
  }, [])

  const handleImportConfig = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const text = await file.text()
      try {
        await Database.importDatabase(text)
        const newConfig = await Database.getAppConfig()
        if (newConfig) {
          await persistConfig(newConfig, setAppConfig)
        }
        toast.success('Database imported successfully')
      } catch (error) {
        toast.error('Invalid database file')
      }
    }
    input.click()
  }, [])

  const toggleNerdMode = useCallback(() => {
    const nextValue = !nerdMode
    setNerdMode(nextValue)
    toast.info(nextValue ? 'Nerd Mode enabled' : 'Nerd Mode disabled')
  }, [nerdMode, setNerdMode])

  const handleSchemasChange = useCallback(
    async (schemas: AppConfiguration['schemas']) => updateConfig((config) => ({ ...config, schemas })),
    [updateConfig]
  )

  const handleWorkflowsChange = useCallback(
    async (workflows: AppConfiguration['workflows']) => updateConfig((config) => ({ ...config, workflows })),
    [updateConfig]
  )

  const handleLuaScriptsChange = useCallback(
    async (luaScripts: AppConfiguration['luaScripts']) => updateConfig((config) => ({ ...config, luaScripts })),
    [updateConfig]
  )

  return {
    appConfig,
    isLoading,
    nerdMode: nerdMode || false,
    handleExportConfig,
    handleImportConfig,
    toggleNerdMode,
    handleSchemasChange,
    handleWorkflowsChange,
    handleLuaScriptsChange,
  }
}
