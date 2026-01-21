import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={editingSource.id}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="font-mono"
      />
    </div>
  )
}
