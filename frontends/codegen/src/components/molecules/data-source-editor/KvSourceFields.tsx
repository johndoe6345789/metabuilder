import { Input } from '@metabuilder/fakemui/inputs'
import { Label } from '@metabuilder/fakemui/atoms'
import { Textarea } from '@metabuilder/fakemui/inputs'
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
      <div>
        <Label>{copy.keyLabel}</Label>
        <Input
          value={editingSource.key || ''}
          onChange={(e) => onUpdateField('key', e.target.value)}
          placeholder={copy.keyPlaceholder}
        />
        <p>
          {copy.keyHelp}
        </p>
      </div>

      <div>
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
        />
      </div>
    </>
  )
}
