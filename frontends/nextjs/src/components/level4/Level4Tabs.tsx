import { Tabs, TabsList, TabsTrigger } from '@/components/ui'
import type { AppConfiguration, LuaScript, User, Workflow } from '@/lib/level-types'
import type { ModelSchema } from '@/lib/types/schema-types'

import { level4TabsConfig } from './tabs/config'
import { TabContent } from './tabs/TabContent'

interface Level4TabsProps {
  appConfig: AppConfiguration
  user: User
  nerdMode: boolean
  onSchemasChange: (schemas: ModelSchema[]) => Promise<void>
  onWorkflowsChange: (workflows: Workflow[]) => Promise<void>
  onLuaScriptsChange: (scripts: LuaScript[]) => Promise<void>
}

export function Level4Tabs({
  appConfig,
  user,
  nerdMode,
  onSchemasChange,
  onWorkflowsChange,
  onLuaScriptsChange,
}: Level4TabsProps) {
  const visibleTabs = level4TabsConfig.filter(tab => (tab.nerdOnly ? nerdMode : true))

  return (
    <Tabs defaultValue="guide" className="space-y-6">
      <TabsList
        className={
          nerdMode
            ? 'grid w-full grid-cols-4 lg:grid-cols-14 max-w-full'
            : 'grid w-full grid-cols-3 lg:grid-cols-7 max-w-full'
        }
      >
        {visibleTabs.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value}>
            <tab.icon className="mr-2" size={16} />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {level4TabsConfig.map(tab => (
        <TabContent
          key={tab.value}
          tab={tab}
          appConfig={appConfig}
          user={user}
          nerdMode={nerdMode}
          onSchemasChange={onSchemasChange}
          onWorkflowsChange={onWorkflowsChange}
          onLuaScriptsChange={onLuaScriptsChange}
        />
      ))}
    </Tabs>
  )
}
