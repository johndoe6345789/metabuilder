import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { SchemaTabs } from '@/components/schema/level4/Tabs'
import { useSchemaLevel4 } from '@/components/schema/level4/useSchemaLevel4'
import type { ModelSchema } from '@/lib/schema-types'
import { Plus, Trash } from '@phosphor-icons/react'

interface SchemaEditorLevel4Props {
  schemas: ModelSchema[]
  onSchemasChange: (schemas: ModelSchema[]) => void
}

export function SchemaEditorLevel4({ schemas, onSchemasChange }: SchemaEditorLevel4Props) {
  const {
    currentModel,
    selectedModel,
    selectModel,
    handleAddField,
    handleAddModel,
    handleDeleteField,
    handleDeleteModel,
    handleUpdateField,
    handleUpdateModel,
  } = useSchemaLevel4({ schemas, onSchemasChange })

  return (
    <div className="grid md:grid-cols-3 gap-6 h-full">
      <Card className="md:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Models</CardTitle>
            <Button size="sm" onClick={handleAddModel}>
              <Plus size={16} />
            </Button>
          </div>
          <CardDescription>Data model definitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {schemas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No models yet. Create one to start.
              </p>
            ) : (
              schemas.map(schema => (
                <div
                  key={schema.name}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedModel === schema.name
                      ? 'bg-accent border-accent-foreground'
                      : 'hover:bg-muted border-border'
                  }`}
                  onClick={() => selectModel(schema.name)}
                >
                  <div>
                    <div className="font-medium text-sm">{schema.label || schema.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {schema.fields.length} fields
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation()
                      handleDeleteModel(schema.name)
                    }}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        {!currentModel ? (
          <CardContent className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground">
              <p>Select or create a model to edit</p>
            </div>
          </CardContent>
        ) : (
          <SchemaTabs
            currentModel={currentModel}
            onUpdateModel={handleUpdateModel}
            onAddField={handleAddField}
            onDeleteField={handleDeleteField}
            onUpdateField={handleUpdateField}
          />
        )}
      </Card>
    </div>
  )
}
