import { Input, Label, Switch } from '@/components/ui'
import type { FieldSchema } from '@/lib/schema-types'

interface ValidationPanelProps {
  field: FieldSchema
  onChange: (updates: Partial<FieldSchema>) => void
}

const numericKeys = ['min', 'max', 'minLength', 'maxLength'] as const
type NumericValidationKey = (typeof numericKeys)[number]

const labels: Record<NumericValidationKey, string> = {
  min: 'Minimum Value',
  max: 'Maximum Value',
  minLength: 'Minimum Length',
  maxLength: 'Maximum Length',
}

export function ValidationPanel({ field, onChange }: ValidationPanelProps) {
  const handleNumberChange = (key: NumericValidationKey, value: string) => {
    const parsedValue = value === '' ? undefined : Number(value)
    const nextValidation = {
      ...field.validation,
      [key]: Number.isNaN(parsedValue) ? undefined : parsedValue,
    }

    onChange({ validation: nextValidation })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {numericKeys.map((key) => (
          <div key={key} className="space-y-2">
            <Label className="text-xs">{labels[key]}</Label>
            <Input
              type="number"
              value={field.validation?.[key] ?? ''}
              onChange={(event) => handleNumberChange(key, event.target.value)}
              placeholder="0"
            />
          </div>
        ))}
        <div className="space-y-2 lg:col-span-2">
          <Label className="text-xs">Pattern (regex)</Label>
          <Input
            value={field.validation?.pattern ?? ''}
            onChange={(event) =>
              onChange({
                validation: {
                  ...field.validation,
                  pattern: event.target.value || undefined,
                },
              })
            }
            placeholder="^\\d{3}-\\d{3}-\\d{4}$"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Toggle label="Required" checked={field.required} onCheckedChange={(checked) => onChange({ required: checked })} />
        <Toggle label="Unique" checked={field.unique} onCheckedChange={(checked) => onChange({ unique: checked })} />
        <Toggle label="Editable" checked={field.editable !== false} onCheckedChange={(checked) => onChange({ editable: checked })} />
        <Toggle label="Searchable" checked={field.searchable} onCheckedChange={(checked) => onChange({ searchable: checked })} />
      </div>
    </div>
  )
}

interface ToggleProps {
  label: string
  checked?: boolean
  onCheckedChange: (value: boolean) => void
}

function Toggle({ label, checked, onCheckedChange }: ToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={checked ?? false} onCheckedChange={onCheckedChange} />
      <Label className="text-xs">{label}</Label>
    </div>
  )
}
