import { Button, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Input, Label } from '@/components/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { ValidationPanel } from '@/components/schema/level4/ValidationPanel'
import type { FieldSchema, FieldType, ModelSchema } from '@/lib/schema-types'
import { Plus, Trash } from '@phosphor-icons/react'

export function SchemaTabs({
  currentModel,
  onUpdateModel,
  onAddField,
  onDeleteField,
  onUpdateField,
}: SchemaTabsProps) {
  const handleFieldChange = (fieldName: string, updates: Partial<FieldSchema>) => {
    onUpdateField(fieldName, updates)
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Edit Model: {currentModel.label ?? currentModel.name}</CardTitle>
        <CardDescription>Configure model properties and fields</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Model Name (ID)"
            value={currentModel.name}
            onChange={(value) => onUpdateModel({ name: value })}
            placeholder="user_model"
          />
          <TextField
            label="Display Label"
            value={currentModel.label || ''}
            onChange={(value) => onUpdateModel({ label: value })}
            placeholder="User"
          />
          <TextField
            label="Plural Label"
            value={currentModel.labelPlural || ''}
            onChange={(value) => onUpdateModel({ labelPlural: value })}
            placeholder="Users"
          />
          <TextField
            label="Icon Name"
            value={currentModel.icon || ''}
            onChange={(value) => onUpdateModel({ icon: value })}
            placeholder="users"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base">Fields</Label>
            <Button size="sm" onClick={onAddField}>
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
                <FieldCard
                  key={field.name}
                  field={field}
                  onChange={(updates) => handleFieldChange(field.name, updates)}
                  onDelete={() => onDeleteField(field.name)}
                />
              ))
            )}
          </div>
        </div>
      </CardContent>
    </>
  )
}
