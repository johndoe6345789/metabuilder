import { Label } from '@metabuilder/fakemui/atoms'
import { Textarea } from '@metabuilder/fakemui/inputs'
import { DataSource } from '@/types/json-ui'

interface StaticSourceFieldsProps {
  editingSource: DataSource
  label: string
  placeholder: string
  onUpdateField: <K extends keyof DataSource>(field: K, value: DataSource[K]) => void
}

export function StaticSourceFields({
  editingSource,
  label,
  placeholder,
  onUpdateField,
}: StaticSourceFieldsProps) {
  return (
    <div>
      <Label>{label}</Label>
      <Textarea
        value={JSON.stringify(editingSource.defaultValue, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value)
            onUpdateField('defaultValue', parsed)
          } catch (err) {
            // Invalid JSON, don't update
          }
        }}
        placeholder={placeholder}
      />
    </div>
  )
}
