import { Plus, Trash } from '@/fakemui/icons'

import { ValidationPanel } from '@/components/schema/level4/ValidationPanel'
import { Button, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Input, Label } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import type { FieldSchema, FieldType, ModelSchema } from '@/lib/schema-types'

export function FieldCard({ field, onChange, onDelete }: FieldCardProps) {
  return (
    <div className="border-2 rounded-lg">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-4 md:grid-cols-2 flex-1">
            <TextField
              label="Field Name"
              value={field.name}
              onChange={value => onChange({ name: value })}
              placeholder="email"
              labelClassName="text-xs"
            />
            <TextField
              label="Label"
              value={field.label || ''}
              onChange={value => onChange({ label: value })}
              placeholder="Email Address"
              labelClassName="text-xs"
            />
            <div className="space-y-2">
              <Label className="text-xs">Type</Label>
              <Select
                value={field.type}
                onValueChange={value => onChange({ type: value as FieldType })}
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
              onChange={value => onChange({ default: value || undefined })}
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
