import { ValidationPanel } from '@/components/schema/level4/ValidationPanel'
import { Button, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Input, Label } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { Plus, Trash } from '@/fakemui/icons'
import type { FieldSchema, FieldType, ModelSchema } from '@/lib/schema-types'

export function TextField({ label, value, onChange, placeholder, labelClassName }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <Label className={labelClassName}>{label}</Label>
      <Input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
