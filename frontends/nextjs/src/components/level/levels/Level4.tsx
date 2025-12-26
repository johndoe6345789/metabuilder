"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Level4Header } from '../../level4/Level4Header'
import { Level4Tabs } from '../../level4/Level4Tabs'
import { Level4Summary } from '../../level4/Level4Summary'
import { NerdModeIDE } from '../../misc/NerdModeIDE'
import { Database } from '@/lib/database'
import { seedDatabase } from '@/lib/seed-data'
import type { User as UserType, AppConfiguration } from '@/lib/level-types'
import { useKV } from '@github/spark/hooks'

interface Level4Props {
  user: UserType
  onLogout: () => void
  onNavigate: (level: number) => void
  onPreview: (level: number) => void
}

export function Level4({ user, onLogout, onNavigate, onPreview }: Level4Props) {
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
        const defaultConfig: AppConfiguration = {
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
        }
        await Database.setAppConfig(defaultConfig)
        setAppConfig(defaultConfig)
      }
      setIsLoading(false)
    }
    loadConfig()
  }, [])

  if (isLoading || !appConfig) return null

  const updateAppConfig = async (updates: Partial<AppConfiguration>) => {
    const newConfig = { ...appConfig, ...updates }
    setAppConfig(newConfig)
    await Database.setAppConfig(newConfig)
  }

  const handleExportConfig = async () => {
    const dataStr = await Database.exportDatabase()
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'database-export.json'
    link.click()
    toast.success('Database exported')
  }

  const handleImportConfig = () => {
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
          setAppConfig(newConfig)
        }
        toast.success('Database imported successfully')
      } catch (error) {
        toast.error('Invalid database file')
      }
    }
    input.click()
  }

  const handleToggleNerdMode = () => {
    setNerdMode(!nerdMode)
    toast.info(nerdMode ? 'Nerd Mode disabled' : 'Nerd Mode enabled')
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Level4Header
        username={user.username}
        nerdMode={nerdMode || false}
        onNavigate={onNavigate}
        onPreview={onPreview}
        onLogout={onLogout}
        onToggleNerdMode={handleToggleNerdMode}
        onExportConfig={handleExportConfig}
        onImportConfig={handleImportConfig}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Application Builder</h1>
          <p className="text-muted-foreground">
            {nerdMode 
              ? "Design your application declaratively. Define schemas, create workflows, and write Lua scripts."
              : "Build your application visually. Configure pages, users, and data models with simple forms."
            }
          </p>
        </div>

        <Level4Tabs
          appConfig={appConfig}
          nerdMode={nerdMode || false}
          onSchemasChange={async (schemas) => {
            const newConfig = { ...appConfig, schemas }
            setAppConfig(newConfig)
            await Database.setAppConfig(newConfig)
          }}
          onWorkflowsChange={async (workflows) => {
            const newConfig = { ...appConfig, workflows }
            setAppConfig(newConfig)
            await Database.setAppConfig(newConfig)
          }}
          onLuaScriptsChange={async (scripts) => {
            const newConfig = { ...appConfig, luaScripts: scripts }
            setAppConfig(newConfig)
            await Database.setAppConfig(newConfig)
          }}
        />

        <Level4Summary appConfig={appConfig} nerdMode={nerdMode || false} />

        {nerdMode && (
          <div className="fixed bottom-4 right-4 w-[calc(100%-2rem)] max-w-[1400px] h-[600px] z-50 shadow-2xl">
            <NerdModeIDE />
          </div>
        )}
      </div>
    </div>
  )
}
