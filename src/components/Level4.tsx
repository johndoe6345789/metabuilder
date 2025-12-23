import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { SignOut, Database, Lightning, Code, Eye, House, Download, Upload } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { SchemaEditorLevel4 } from './SchemaEditorLevel4'
import { WorkflowEditor } from './WorkflowEditor'
import { LuaEditor } from './LuaEditor'
import type { User as UserType, AppConfiguration } from '@/lib/level-types'
import type { ModelSchema } from '@/lib/schema-types'

interface Level4Props {
  user: UserType
  onLogout: () => void
  onNavigate: (level: number) => void
  onPreview: (level: number) => void
}

export function Level4({ user, onLogout, onNavigate, onPreview }: Level4Props) {
  const [appConfig, setAppConfig] = useKV<AppConfiguration>('app_configuration', {
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

  if (!appConfig) return null

  const handleExportConfig = () => {
    const dataStr = JSON.stringify(appConfig, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'app-config.json'
    link.click()
    toast.success('Configuration exported')
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
        const config = JSON.parse(text)
        setAppConfig(config)
        toast.success('Configuration imported')
      } catch (error) {
        toast.error('Invalid configuration file')
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
              <div className="hidden sm:flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onPreview(1)}>
                  <Eye className="mr-2" size={16} />
                  Preview L1
                </Button>
                <Button variant="outline" size="sm" onClick={() => onPreview(2)}>
                  <Eye className="mr-2" size={16} />
                  Preview L2
                </Button>
                <Button variant="outline" size="sm" onClick={() => onPreview(3)}>
                  <Eye className="mr-2" size={16} />
                  Preview L3
                </Button>
              </div>
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
            Design your application declaratively. Define schemas, create workflows, and write Lua scripts.
          </p>
        </div>

        <Tabs defaultValue="schemas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="schemas">
              <Database className="mr-2" size={16} />
              Data Schemas
              <Badge variant="secondary" className="ml-2">{appConfig.schemas.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="workflows">
              <Lightning className="mr-2" size={16} />
              Workflows
              <Badge variant="secondary" className="ml-2">{appConfig.workflows.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="lua">
              <Code className="mr-2" size={16} />
              Lua Scripts
              <Badge variant="secondary" className="ml-2">{appConfig.luaScripts.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schemas" className="space-y-6">
            <SchemaEditorLevel4
              schemas={appConfig.schemas}
              onSchemasChange={(schemas) =>
                setAppConfig((current) => ({ ...current!, schemas }))
              }
            />
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <WorkflowEditor
              workflows={appConfig.workflows}
              onWorkflowsChange={(workflows) =>
                setAppConfig((current) => ({ ...current!, workflows }))
              }
            />
          </TabsContent>

          <TabsContent value="lua" className="space-y-6">
            <LuaEditor
              scripts={appConfig.luaScripts}
              onScriptsChange={(luaScripts) =>
                setAppConfig((current) => ({ ...current!, luaScripts }))
              }
            />
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
          </div>
        </div>
      </div>
    </div>
  )
}
