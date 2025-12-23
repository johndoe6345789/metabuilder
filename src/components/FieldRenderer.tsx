import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import type { FieldSchema, SchemaConfig } from '@/lib/schema-types'
import { getFieldLabel, getHelpText, findModel, getModelLabel } from '@/lib/schema-utils'
import { useKV } from '@github/spark/hooks'
import { getRecordsKey } from '@/lib/schema-utils'

interface FieldRendererProps {
  field: FieldSchema
  value: any
  onChange: (value: any) => void
  error?: string
  schema: SchemaConfig
  currentApp: string
}

export function FieldRenderer({ field, value, onChange, error, schema, currentApp }: FieldRendererProps) {
  const label = getFieldLabel(field)
  const helpText = getHelpText(field)

  const relatedRecordsKey = field.relatedModel ? getRecordsKey(currentApp, field.relatedModel) : 'dummy'
  const [relatedModelRecords] = useKV<any[]>(relatedRecordsKey, [])

  const relatedModel = field.type === 'relation' && field.relatedModel
    ? findModel(schema, currentApp, field.relatedModel)
    : null

  const renderInput = () => {
    if (field.editable === false) {
      return (
        <Input
          id={field.name}
          value={value || ''}
          disabled
          className="bg-muted font-mono text-sm"
        />
      )
    }

    switch (field.type) {
      case 'string':
      case 'email':
      case 'url':
        return (
          <Input
            id={field.name}
            type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={label}
            className={error ? 'border-destructive' : ''}
          />
        )

      case 'text':
        return (
          <Textarea
            id={field.name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={label}
            rows={6}
            className={error ? 'border-destructive' : ''}
          />
        )

      case 'number':
        return (
          <Input
            id={field.name}
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            placeholder={label}
            min={field.validation?.min}
            max={field.validation?.max}
            className={error ? 'border-destructive' : ''}
          />
        )

      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Switch
              id={field.name}
              checked={!!value}
              onCheckedChange={onChange}
            />
            <Label htmlFor={field.name} className="text-sm font-normal">
              {value ? 'Yes' : 'No'}
            </Label>
          </div>
        )

      case 'date':
        return (
          <Input
            id={field.name}
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
            className={error ? 'border-destructive' : ''}
          />
        )

      case 'datetime':
        return (
          <Input
            id={field.name}
            type="datetime-local"
            value={value ? new Date(value).toISOString().slice(0, 16) : ''}
            onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
            className={error ? 'border-destructive' : ''}
          />
        )

      case 'select':
        return (
          <Select value={value || undefined} onValueChange={onChange}>
            <SelectTrigger id={field.name} className={error ? 'border-destructive' : ''}>
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.choices?.map((choice) => (
                <SelectItem key={choice.value} value={choice.value}>
                  {choice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'relation':
        if (!relatedModel || !relatedModelRecords || relatedModelRecords.length === 0) {
          return (
            <div className="text-sm text-muted-foreground p-2 border border-dashed rounded">
              No {field.relatedModel} records available
            </div>
          )
        }

        const displayField = relatedModel.fields.find(f => f.name === 'name' || f.name === 'title')?.name || 'id'

        return (
          <Select value={value || undefined} onValueChange={onChange}>
            <SelectTrigger id={field.name} className={error ? 'border-destructive' : ''}>
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {relatedModelRecords.map((record: any) => (
                <SelectItem key={record.id} value={record.id}>
                  {record[displayField] || record.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'json':
        return (
          <Textarea
            id={field.name}
            value={value ? JSON.stringify(value, null, 2) : ''}
            onChange={(e) => {
              try {
                const parsed = e.target.value ? JSON.parse(e.target.value) : null
                onChange(parsed)
              } catch {
                onChange(e.target.value)
              }
            }}
            placeholder='{"key": "value"}'
            rows={6}
            className={`font-mono text-sm ${error ? 'border-destructive' : ''}`}
          />
        )

      default:
        return (
          <Input
            id={field.name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={label}
            className={error ? 'border-destructive' : ''}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium uppercase tracking-wide">
        {label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderInput()}
      {helpText && !error && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
