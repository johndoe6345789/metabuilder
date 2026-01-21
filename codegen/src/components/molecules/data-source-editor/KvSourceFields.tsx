import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DataSource } from '@/types/json-ui'

interface KvSourceFieldsCopy {
  keyLabel: string
  keyPlaceholder: string
  keyHelp: string
  defaultLabel: string
  defaultPlaceholder: string
}

interface KvSourceFieldsProps {
  editingSource: DataSource
  copy: KvSourceFieldsCopy
  onUpdateField: <K extends keyof DataSource>(field: K, value: DataSource[K]) => void
}

export function KvSourceFields({ editingSource, copy, onUpdateField }: KvSourceFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>{copy.keyLabel}</Label>
        <Input
          value={editingSource.key || ''}
          onChange={(e) => onUpdateField('key', e.target.value)}
          placeholder={copy.keyPlaceholder}
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">
          {copy.keyHelp}
        </p>
      </div>

      <div className="space-y-2">
        <Label>{copy.defaultLabel}</Label>
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
          placeholder={copy.defaultPlaceholder}
          className="font-mono text-sm h-24"
        />
      </div>
    </>
  )
}
