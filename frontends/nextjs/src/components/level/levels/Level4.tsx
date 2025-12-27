"use client"

import { Level4Header } from '../../level4/Level4Header'
import { Level4Tabs } from '../../level4/Level4Tabs'
import { Level4Summary } from '../../level4/Level4Summary'
import { NerdModeIDE } from '../../misc/NerdModeIDE'
import type { User as UserType } from '@/lib/level-types'
import { useLevel4AppState } from './hooks/useLevel4AppState'

interface Level4Props {
  user: UserType
  onLogout: () => void
  onNavigate: (level: number) => void
  onPreview: (level: number) => void
}

export function Level4({ user, onLogout, onNavigate, onPreview }: Level4Props) {
  const {
    appConfig,
    handleExportConfig,
    handleImportConfig,
    handleLuaScriptsChange,
    handleSchemasChange,
    handleWorkflowsChange,
    isLoading,
    nerdMode,
    toggleNerdMode,
  } = useLevel4AppState()

  if (isLoading || !appConfig) return null

  return (
    <div className="min-h-screen bg-canvas">
      <Level4Header
        username={user.username}
        nerdMode={nerdMode}
        onNavigate={onNavigate}
        onPreview={onPreview}
        onLogout={onLogout}
        onToggleNerdMode={toggleNerdMode}
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
          nerdMode={nerdMode}
          onSchemasChange={handleSchemasChange}
          onWorkflowsChange={handleWorkflowsChange}
          onLuaScriptsChange={handleLuaScriptsChange}
        />

        <Level4Summary appConfig={appConfig} nerdMode={nerdMode} />

        {nerdMode && (
          <div className="fixed bottom-4 right-4 w-[calc(100%-2rem)] max-w-[1400px] h-[600px] z-50 shadow-2xl">
            <NerdModeIDE />
          </div>
        )}
      </div>
    </div>
  )
}
