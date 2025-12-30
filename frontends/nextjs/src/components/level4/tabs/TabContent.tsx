import { ComponentHierarchyEditor } from '@/components/ComponentHierarchyEditor'
import { CssClassManager } from '@/components/CssClassManager'
import { DropdownConfigManager } from '@/components/DropdownConfigManager'
import { LuaBlocksEditor } from '@/components/editors/lua/LuaBlocksEditor'
import { LuaEditor } from '@/components/editors/lua/LuaEditor'
import { LuaSnippetLibrary } from '@/components/editors/lua/LuaSnippetLibrary'
import { GodCredentialsSettings } from '@/components/GodCredentialsSettings'
import { ErrorLogsTab } from '@/components/level5/tabs/error-logs/ErrorLogsTab'
import { DatabaseManager } from '@/components/managers/database/DatabaseManager'
import { PageRoutesManager } from '@/components/managers/PageRoutesManager'
import { PackageManager } from '@/components/PackageManager'
import { QuickGuide } from '@/components/QuickGuide'
import { SchemaEditorLevel4 } from '@/components/SchemaEditorLevel4'
import { SMTPConfigEditor } from '@/components/SMTPConfigEditor'
import { ThemeEditor } from '@/components/ThemeEditor'
import { TabsContent } from '@/components/ui'
import { UserManagement } from '@/components/UserManagement'
import { WorkflowEditor } from '@/components/WorkflowEditor'
import type { AppConfiguration, LuaScript, User, Workflow } from '@/lib/level-types'
import type { ModelSchema } from '@/lib/types/schema-types'

import type { Level4TabConfig } from './config'

interface Level4TabContentProps {
  tab: Level4TabConfig
  appConfig: AppConfiguration
  user: User
  nerdMode: boolean
  onSchemasChange: (schemas: ModelSchema[]) => Promise<void>
  onWorkflowsChange: (workflows: Workflow[]) => Promise<void>
  onLuaScriptsChange: (scripts: LuaScript[]) => Promise<void>
}

export function TabContent({
  tab,
  appConfig,
  user,
  nerdMode,
  onSchemasChange,
  onWorkflowsChange,
  onLuaScriptsChange,
}: Level4TabContentProps) {
  if (tab.nerdOnly && !nerdMode) return null

  switch (tab.value) {
    case 'guide':
      return (
        <TabsContent value={tab.value} className="space-y-6">
          <QuickGuide />
        </TabsContent>
      )
    case 'packages':
      return (
        <TabsContent value={tab.value} className="space-y-6">
          <PackageManager />
        </TabsContent>
      )
    case 'pages':
      return (
        <TabsContent value={tab.value} className="space-y-6">
          <PageRoutesManager />
        </TabsContent>
      )
    case 'hierarchy':
      return (
        <TabsContent value={tab.value} className="space-y-6">
          <ComponentHierarchyEditor nerdMode={nerdMode} />
        </TabsContent>
      )
    case 'users':
      return (
        <TabsContent value={tab.value} className="space-y-6">
          <UserManagement />
        </TabsContent>
      )
    case 'schemas':
      return (
        <TabsContent value={tab.value} className="space-y-6">
          <SchemaEditorLevel4 schemas={appConfig.schemas} onSchemasChange={onSchemasChange} />
        </TabsContent>
      )
    case 'workflows':
      return (
        <TabsContent value={tab.value} className="space-y-6">
          <WorkflowEditor
            workflows={appConfig.workflows}
            onWorkflowsChange={onWorkflowsChange}
            scripts={appConfig.luaScripts}
          />
        </TabsContent>
      )
    case 'lua':
      return (
        <TabsContent value={tab.value} className="space-y-6">
          <LuaEditor scripts={appConfig.luaScripts} onScriptsChange={onLuaScriptsChange} />
        </TabsContent>
      )
    case 'blocks':
      return (
        <TabsContent value={tab.value} className="space-y-6">
          <LuaBlocksEditor scripts={appConfig.luaScripts} onScriptsChange={onLuaScriptsChange} />
        </TabsContent>
      )
    case 'snippets':
      return (
        <TabsContent value={tab.value} className="space-y-6">
          <LuaSnippetLibrary />
        </TabsContent>
      )
    case 'css':
      return (
        <TabsContent value={tab.value} className="space-y-6">
          <CssClassManager />
        </TabsContent>
      )
    case 'dropdowns':
      return (
        <TabsContent value={tab.value} className="space-y-6">
          <DropdownConfigManager />
        </TabsContent>
      )
    case 'database':
      return (
        <TabsContent value={tab.value} className="space-y-6">
          <DatabaseManager />
        </TabsContent>
      )
    case 'settings':
      return (
        <TabsContent value={tab.value} className="space-y-6">
          <GodCredentialsSettings />
          <ThemeEditor />
          <SMTPConfigEditor />
        </TabsContent>
      )
    case 'errorlogs':
      return (
        <TabsContent value={tab.value} className="space-y-6">
          <ErrorLogsTab user={user} />
        </TabsContent>
      )
    default:
      return null
  }
}
