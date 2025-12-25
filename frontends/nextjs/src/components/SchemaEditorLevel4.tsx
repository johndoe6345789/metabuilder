import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { ModelSchema, FieldSchema, FieldType } from '@/lib/schema-types'

interface SchemaEditorLevel4Props {
  schemas: ModelSchema[]
  onSchemasChange: (schemas: ModelSchema[]) => void
}

export function SchemaEditorLevel4({ schemas, onSchemasChange }: SchemaEditorLevel4Props) {
  const [selectedModel, setSelectedModel] = useState<string | null>(
    schemas.length > 0 ? schemas[0].name : null
  )

  const currentModel = schemas.find(s => s.name === selectedModel)

  const handleAddModel = () => {
    const newModel: ModelSchema = {
      name: `Model_${Date.now()}`,
      label: 'New Model',
      fields: [],
    }
    onSchemasChange([...schemas, newModel])
    setSelectedModel(newModel.name)
    toast.success('Model created')
  }

  const handleDeleteModel = (modelName: string) => {
    onSchemasChange(schemas.filter(s => s.name !== modelName))
    if (selectedModel === modelName) {
      setSelectedModel(schemas.length > 1 ? schemas[0].name : null)
    }
    toast.success('Model deleted')
  }

  const handleUpdateModel = (updates: Partial<ModelSchema>) => {
    if (!currentModel) return
    
    onSchemasChange(
      schemas.map(s => s.name === selectedModel ? { ...s, ...updates } : s)
    )
  }

  const handleAddField = () => {
    if (!currentModel) return

    const newField: FieldSchema = {
      name: `field_${Date.now()}`,
      type: 'string',
      label: 'New Field',
      required: false,
      editable: true,
    }

    handleUpdateModel({
      fields: [...currentModel.fields, newField],
    })
    toast.success('Field added')
  }

  const handleDeleteField = (fieldName: string) => {
    if (!currentModel) return

    handleUpdateModel({
      fields: currentModel.fields.filter(f => f.name !== fieldName),
    })
    toast.success('Field deleted')
  }

  const handleUpdateField = (fieldName: string, updates: Partial<FieldSchema>) => {
    if (!currentModel) return

    handleUpdateModel({
      fields: currentModel.fields.map(f =>
        f.name === fieldName ? { ...f, ...updates } : f
      ),
    })
  }

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
              schemas.map((schema) => (
                <div
                  key={schema.name}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedModel === schema.name
                      ? 'bg-accent border-accent-foreground'
                      : 'hover:bg-muted border-border'
                  }`}
                  onClick={() => setSelectedModel(schema.name)}
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
                    onClick={(e) => {
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
          <>
            <CardHeader>
              <CardTitle>Edit Model: {currentModel.label}</CardTitle>
              <CardDescription>Configure model properties and fields</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Model Name (ID)</Label>
                  <Input
                    value={currentModel.name}
                    onChange={(e) => handleUpdateModel({ name: e.target.value })}
                    placeholder="user_model"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display Label</Label>
                  <Input
                    value={currentModel.label || ''}
                    onChange={(e) => handleUpdateModel({ label: e.target.value })}
                    placeholder="User"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plural Label</Label>
                  <Input
                    value={currentModel.labelPlural || ''}
                    onChange={(e) => handleUpdateModel({ labelPlural: e.target.value })}
                    placeholder="Users"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon Name</Label>
                  <Input
                    value={currentModel.icon || ''}
                    onChange={(e) => handleUpdateModel({ icon: e.target.value })}
                    placeholder="Users"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base">Fields</Label>
                  <Button size="sm" onClick={handleAddField}>
                    <Plus className="mr-2" size={16} />
                    Add Field
                  </Button>
                </div>

                <div className="space-y-4">
                  {currentModel.fields.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
                      No fields yet. Add a field to start.
                    </p>
                  ) : (
                    currentModel.fields.map((field) => (
                      <Card key={field.name} className="border-2">
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="grid gap-4 md:grid-cols-2 flex-1">
                              <div className="space-y-2">
                                <Label className="text-xs">Field Name</Label>
                                <Input
                                  value={field.name}
                                  onChange={(e) =>
                                    handleUpdateField(field.name, { name: e.target.value })
                                  }
                                  placeholder="email"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">Label</Label>
                                <Input
                                  value={field.label || ''}
                                  onChange={(e) =>
                                    handleUpdateField(field.name, { label: e.target.value })
                                  }
                                  placeholder="Email Address"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">Type</Label>
                                <Select
                                  value={field.type}
                                  onValueChange={(value) =>
                                    handleUpdateField(field.name, { type: value as FieldType })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="string">String</SelectItem>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="boolean">Boolean</SelectItem>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="datetime">DateTime</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="url">URL</SelectItem>
                                    <SelectItem value="select">Select</SelectItem>
                                    <SelectItem value="relation">Relation</SelectItem>
                                    <SelectItem value="json">JSON</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">Default Value</Label>
                                <Input
                                  value={field.default || ''}
                                  onChange={(e) =>
                                    handleUpdateField(field.name, { default: e.target.value })
                                  }
                                  placeholder="Default"
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteField(field.name)}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>

                          <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.required || false}
                                onCheckedChange={(checked) =>
                                  handleUpdateField(field.name, { required: checked })
                                }
                              />
                              <Label className="text-xs">Required</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.unique || false}
                                onCheckedChange={(checked) =>
                                  handleUpdateField(field.name, { unique: checked })
                                }
                              />
                              <Label className="text-xs">Unique</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.editable !== false}
                                onCheckedChange={(checked) =>
                                  handleUpdateField(field.name, { editable: checked })
                                }
                              />
                              <Label className="text-xs">Editable</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.searchable || false}
                                onCheckedChange={(checked) =>
                                  handleUpdateField(field.name, { searchable: checked })
                                }
                              />
                              <Label className="text-xs">Searchable</Label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
