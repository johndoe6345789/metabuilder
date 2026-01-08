import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOut, Database as DatabaseIcon, Lightning, Code, Eye, House, Download, Upload, BookOpen, HardDrives, MapTrifold, Tree, Users, Gear, Palette, ListDashes, Sparkle, Package, Terminal } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { SchemaEditorLevel4 } from './SchemaEditorLevel4'
import { WorkflowEditor } from './WorkflowEditor'
import { LuaEditor } from './LuaEditor'
import { LuaSnippetLibrary } from './LuaSnippetLibrary'
import { DatabaseManager } from './DatabaseManager'
import { PageRoutesManager } from './PageRoutesManager'
import { ComponentHierarchyEditor } from './ComponentHierarchyEditor'
import { UserManagement } from './UserManagement'
import { GodCredentialsSettings } from './GodCredentialsSettings'
import { CssClassManager } from './CssClassManager'
import { DropdownConfigManager } from './DropdownConfigManager'
import { QuickGuide } from './QuickGuide'
import { PackageManager } from './PackageManager'
import { NerdModeIDE } from './NerdModeIDE'
import { ThemeEditor } from './ThemeEditor'
import { SMTPConfigEditor } from './SMTPConfigEditor'
import { Database } from '@/lib/database'
import { seedDatabase } from '@/lib/seed-data'
import type { User as UserType, AppConfiguration } from '@/lib/level-types'
import type { ModelSchema } from '@/lib/schema-types'
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

  return (
    <div className="min-h-screen bg-canvas">
      <nav className="border-b border-sidebar-border bg-sidebar sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600" />
                <span className="font-bold text-xl text-sidebar-foreground">God-Tier Builder</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate(1)} className="text-sidebar-foreground">
                <House className="mr-2" size={16} />
                Home
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex gap-2 items-center">
                <div className="text-xs text-sidebar-foreground/70 font-medium mr-1">PREVIEW:</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onPreview(1)}
                  className="bg-sidebar-accent hover:bg-sidebar-accent/80"
                >
                  <Eye className="mr-2" size={16} />
                  Level 1
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onPreview(2)}
                  className="bg-sidebar-accent hover:bg-sidebar-accent/80"
                >
                  <Eye className="mr-2" size={16} />
                  Level 2
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onPreview(3)}
                  className="bg-sidebar-accent hover:bg-sidebar-accent/80"
                >
                  <Eye className="mr-2" size={16} />
                  Level 3
                </Button>
              </div>
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye size={16} className="mr-2" />
                      Preview
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onPreview(1)}>
                      <Eye className="mr-2" size={16} />
                      Level 1 (Public)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPreview(2)}>
                      <Eye className="mr-2" size={16} />
                      Level 2 (User Area)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPreview(3)}>
                      <Eye className="mr-2" size={16} />
                      Level 3 (Admin Panel)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="w-px h-6 bg-sidebar-border hidden sm:block" />
              <Button 
                variant={nerdMode ? "default" : "outline"} 
                size="sm" 
                onClick={() => {
                  setNerdMode(!nerdMode)
                  toast.info(nerdMode ? 'Nerd Mode disabled' : 'Nerd Mode enabled')
                }}
              >
                <Terminal className="mr-2" size={16} />
                Nerd
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportConfig}>
                <Download size={16} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleImportConfig}>
                <Upload size={16} />
              </Button>
              <Badge variant="secondary">{user.username}</Badge>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-sidebar-foreground">
                <SignOut size={16} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

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
              onSchemasChange={async (schemas) => {
                const newConfig = { ...appConfig, schemas }
                setAppConfig(newConfig)
                await Database.setAppConfig(newConfig)
              }}
            />
          </TabsContent>

          {nerdMode && (
            <>
              <TabsContent value="workflows" className="space-y-6">
                <WorkflowEditor
                  workflows={appConfig.workflows}
                  onWorkflowsChange={async (workflows) => {
                    const newConfig = { ...appConfig, workflows }
                    setAppConfig(newConfig)
                    await Database.setAppConfig(newConfig)
                  }}
                  scripts={appConfig.luaScripts}
                />
              </TabsContent>

              <TabsContent value="lua" className="space-y-6">
                <LuaEditor
                  scripts={appConfig.luaScripts}
                  onScriptsChange={async (scripts) => {
                    const newConfig = { ...appConfig, luaScripts: scripts }
                    setAppConfig(newConfig)
                    await Database.setAppConfig(newConfig)
                  }}
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

        <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-dashed border-primary/30">
          <h3 className="font-semibold mb-2">Configuration Summary</h3>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Models:</span>
              <span className="font-medium">{appConfig.schemas.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Fields:</span>
              <span className="font-medium">
                {appConfig.schemas.reduce((acc, s) => acc + s.fields.length, 0)}
              </span>
            </div>
            {nerdMode && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Workflows:</span>
                  <span className="font-medium">{appConfig.workflows.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Workflow Nodes:</span>
                  <span className="font-medium">
                    {appConfig.workflows.reduce((acc, w) => acc + w.nodes.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lua Scripts:</span>
                  <span className="font-medium">{appConfig.luaScripts.length}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {nerdMode && (
          <div className="fixed bottom-4 right-4 w-[calc(100%-2rem)] max-w-[1400px] h-[600px] z-50 shadow-2xl">
            <NerdModeIDE />
          </div>
        )}
      </div>
    </div>
  )
}
