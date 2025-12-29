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

interface SchemaTabsProps {
  currentModel: ModelSchema
  onUpdateModel: (updates: Partial<ModelSchema>) => void
  onAddField: () => void
  onDeleteField: (fieldName: string) => void
  onUpdateField: (fieldName: string, updates: Partial<FieldSchema>) => void
}

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

interface FieldCardProps {
  field: FieldSchema
  onChange: (updates: Partial<FieldSchema>) => void
  onDelete: () => void
}

function FieldCard({ field, onChange, onDelete }: FieldCardProps) {
  return (
    <div className="border-2 rounded-lg">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-4 md:grid-cols-2 flex-1">
            <TextField
              label="Field Name"
              value={field.name}
              onChange={(value) => onChange({ name: value })}
              placeholder="email"
              labelClassName="text-xs"
            />
            <TextField
              label="Label"
              value={field.label || ''}
              onChange={(value) => onChange({ label: value })}
              placeholder="Email Address"
              labelClassName="text-xs"
            />
            <div className="space-y-2">
              <Label className="text-xs">Type</Label>
              <Select
                value={field.type}
                onValueChange={(value) => onChange({ type: value as FieldType })}
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
            <TextField
              label="Default Value"
              value={field.default ?? ''}
              onChange={(value) => onChange({ default: value || undefined })}
              placeholder="Default"
              labelClassName="text-xs"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash size={16} />
          </Button>
        </div>

        <ValidationPanel field={field} onChange={onChange} />
      </CardContent>
    </div>
  )
}

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  labelClassName?: string
}

function TextField({ label, value, onChange, placeholder, labelClassName }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <Label className={labelClassName}>{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
