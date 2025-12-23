import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { SchemaConfig } from '@/lib/schema-types'
import { defaultSchema } from '@/lib/default-schema'
import { getModelLabelPlural, getModelLabel } from '@/lib/schema-utils'
import { ModelListView } from '@/components/ModelListView'
import { SchemaEditor } from '@/components/SchemaEditor'
import { Database, Code, List } from '@phosphor-icons/react'

function App() {
  const [schema, setSchema] = useKV<SchemaConfig>('admin_schema', defaultSchema)
  const [selectedApp, setSelectedApp] = useState(schema?.apps[0]?.name || '')
  const [selectedModel, setSelectedModel] = useState(schema?.apps[0]?.models[0]?.name || '')
  const [schemaEditorOpen, setSchemaEditorOpen] = useState(false)

  if (!schema) return null

  const currentApp = schema.apps.find(app => app.name === selectedApp)
  const currentModel = currentApp?.models.find(model => model.name === selectedModel)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-sidebar-foreground flex items-center gap-2">
            <Database weight="fill" />
            Admin Panel
          </h1>
          <p className="text-sm text-sidebar-foreground/70 mt-1">Django-Style Generator</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {schema.apps.map(app => (
              <div key={app.name} className="space-y-2">
                <h3 className="text-xs uppercase font-semibold text-sidebar-foreground/60 tracking-wider px-2">
                  {app.label || app.name}
                </h3>
                <div className="space-y-1">
                  {app.models.map(model => (
                    <Button
                      key={model.name}
                      variant={selectedApp === app.name && selectedModel === model.name ? 'default' : 'ghost'}
                      className={`w-full justify-start ${
                        selectedApp === app.name && selectedModel === model.name
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                      onClick={() => {
                        setSelectedApp(app.name)
                        setSelectedModel(model.name)
                      }}
                    >
                      <List className="mr-2" size={18} />
                      {getModelLabelPlural(model)}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator className="bg-sidebar-border" />

        <div className="p-4">
          <Button
            variant="outline"
            className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setSchemaEditorOpen(true)}
          >
            <Code className="mr-2" />
            Edit Schema
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-card px-6 py-4">
          {currentModel && (
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                {getModelLabelPlural(currentModel)}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage {getModelLabel(currentModel).toLowerCase()} records
              </p>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-auto p-6">
          {currentModel && currentApp ? (
            <ModelListView
              model={currentModel}
              schema={schema}
              currentApp={currentApp.name}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a model from the sidebar</p>
            </div>
          )}
        </div>
      </main>

      <SchemaEditor
        open={schemaEditorOpen}
        onClose={() => setSchemaEditorOpen(false)}
        schema={schema}
        onSave={setSchema}
      />

      <Toaster />
    </div>
  )
}

export default App
