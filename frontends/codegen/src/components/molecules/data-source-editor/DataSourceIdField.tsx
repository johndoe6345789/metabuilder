import { Input } from '@metabuilder/fakemui/inputs'
import { Label } from '@metabuilder/fakemui/atoms'
import { DataSource } from '@/types/json-ui'

interface DataSourceIdFieldProps {
  editingSource: DataSource
  label: string
  placeholder: string
  onChange: (value: string) => void
}

export function DataSourceIdField({
  editingSource,
  label,
  placeholder,
  onChange,
}: DataSourceIdFieldProps) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        value={editingSource.id}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
