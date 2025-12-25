import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Database as DatabaseIcon, Lightning, Code, BookOpen, HardDrives, MapTrifold, Tree, Users, Gear, Palette, ListDashes, Sparkle, Package } from '@phosphor-icons/react'
import { SchemaEditorLevel4 } from '@/components/SchemaEditorLevel4'
import { WorkflowEditor } from '@/components/WorkflowEditor'
import { LuaEditor } from '@/components/LuaEditor'
import { LuaSnippetLibrary } from '@/components/LuaSnippetLibrary'
import { DatabaseManager } from '@/components/DatabaseManager'
import { PageRoutesManager } from '@/components/PageRoutesManager'
import { ComponentHierarchyEditor } from '@/components/ComponentHierarchyEditor'
import { UserManagement } from '@/components/UserManagement'
import { GodCredentialsSettings } from '@/components/GodCredentialsSettings'
import { CssClassManager } from '@/components/CssClassManager'
import { DropdownConfigManager } from '@/components/DropdownConfigManager'
import { QuickGuide } from '@/components/QuickGuide'
import { PackageManager } from '@/components/PackageManager'
import { ThemeEditor } from '@/components/ThemeEditor'
import { SMTPConfigEditor } from '@/components/SMTPConfigEditor'
import type { AppConfiguration } from '@/lib/level-types'

interface Level4TabsProps {
  appConfig: AppConfiguration
  nerdMode: boolean
  onSchemasChange: (schemas: any[]) => Promise<void>
  onWorkflowsChange: (workflows: any[]) => Promise<void>
  onLuaScriptsChange: (scripts: any[]) => Promise<void>
}

export function Level4Tabs({
  appConfig,
  nerdMode,
  onSchemasChange,
  onWorkflowsChange,
  onLuaScriptsChange,
}: Level4TabsProps) {
  return (
    <Tabs defaultValue="guide" className="space-y-6">
      <TabsList className={nerdMode ? "grid w-full grid-cols-4 lg:grid-cols-13 max-w-full" : "grid w-full grid-cols-3 lg:grid-cols-7 max-w-full"}>
        <TabsTrigger value="guide">
          <Sparkle className="mr-2" size={16} />
          Guide
        </TabsTrigger>
        <TabsTrigger value="packages">
          <Package className="mr-2" size={16} />
          Packages
        </TabsTrigger>
        <TabsTrigger value="pages">
          <MapTrifold className="mr-2" size={16} />
          Page Routes
        </TabsTrigger>
        <TabsTrigger value="hierarchy">
          <Tree className="mr-2" size={16} />
          Components
        </TabsTrigger>
        <TabsTrigger value="users">
          <Users className="mr-2" size={16} />
          Users
        </TabsTrigger>
        <TabsTrigger value="schemas">
          <DatabaseIcon className="mr-2" size={16} />
          Schemas
        </TabsTrigger>
        {nerdMode && (
          <>
            <TabsTrigger value="workflows">
              <Lightning className="mr-2" size={16} />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="lua">
              <Code className="mr-2" size={16} />
              Lua Scripts
            </TabsTrigger>
            <TabsTrigger value="snippets">
              <BookOpen className="mr-2" size={16} />
              Snippets
            </TabsTrigger>
            <TabsTrigger value="css">
              <Palette className="mr-2" size={16} />
              CSS Classes
            </TabsTrigger>
            <TabsTrigger value="dropdowns">
              <ListDashes className="mr-2" size={16} />
              Dropdowns
            </TabsTrigger>
            <TabsTrigger value="database">
              <HardDrives className="mr-2" size={16} />
              Database
            </TabsTrigger>
          </>
        )}
        <TabsTrigger value="settings">
          <Gear className="mr-2" size={16} />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="guide" className="space-y-6">
        <QuickGuide />
      </TabsContent>

      <TabsContent value="packages" className="space-y-6">
        <PackageManager />
      </TabsContent>

      <TabsContent value="pages" className="space-y-6">
        <PageRoutesManager />
      </TabsContent>

      <TabsContent value="hierarchy" className="space-y-6">
        <ComponentHierarchyEditor nerdMode={nerdMode} />
      </TabsContent>

      <TabsContent value="users" className="space-y-6">
        <UserManagement />
      </TabsContent>

      <TabsContent value="schemas" className="space-y-6">
        <SchemaEditorLevel4
          schemas={appConfig.schemas}
          onSchemasChange={onSchemasChange}
        />
      </TabsContent>

      {nerdMode && (
        <>
          <TabsContent value="workflows" className="space-y-6">
            <WorkflowEditor
              workflows={appConfig.workflows}
              onWorkflowsChange={onWorkflowsChange}
              scripts={appConfig.luaScripts}
            />
          </TabsContent>

          <TabsContent value="lua" className="space-y-6">
            <LuaEditor
              scripts={appConfig.luaScripts}
              onScriptsChange={onLuaScriptsChange}
            />
          </TabsContent>

          <TabsContent value="snippets" className="space-y-6">
            <LuaSnippetLibrary />
          </TabsContent>

          <TabsContent value="css" className="space-y-6">
            <CssClassManager />
          </TabsContent>

          <TabsContent value="dropdowns" className="space-y-6">
            <DropdownConfigManager />
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <DatabaseManager />
          </TabsContent>
        </>
      )}

      <TabsContent value="settings" className="space-y-6">
        <GodCredentialsSettings />
        <ThemeEditor />
        <SMTPConfigEditor />
      </TabsContent>
    </Tabs>
  )
}
