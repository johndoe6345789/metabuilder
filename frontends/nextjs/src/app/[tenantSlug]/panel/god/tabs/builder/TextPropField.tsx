'use client'

import { useId } from 'react'
import { TextField } from '@/m3'
import type { PropField } from '@/components/blocks/block-props'
import type { DropdownConfig } from '../config/use-dropdown-configs'

export interface TextPropFieldProps {
  field: PropField
  current: unknown
  warning?: string
  configs?: DropdownConfig[]
  onChange: (patch: Record<string, unknown>) => void
}

export function TextPropField({
  field,
  current,
  warning,
  configs,
  onChange,
}: TextPropFieldProps) {
  const listId = useId()
  /**
   * `source` names a Config-tab list, and until now only `select` fields
   * consulted it -- so a text field declaring one (an icon name, a chat
   * channel) silently ignored the tenant's list and left the author to
   * recall the exact spelling of something they had already written down
   * elsewhere. A datalist offers those values without closing the field:
   * these are open vocabularies, so a name the list has never heard of
   * still has to be typeable.
   */
  const suggestions =
    field.source === undefined
      ? undefined
      : configs?.find(c => c.name === field.source)?.options

  return (
    <>
      <TextField
        size="small"
        fullWidth
        label={field.label}
        placeholder={field.placeholder}
        helperText={warning ?? field.hint}
        error={warning !== undefined}
        value={typeof current === 'string' ? current : ''}
        list={suggestions === undefined ? undefined : listId}
        onChange={event => {
          onChange({ [field.name]: event.target.value })
        }}
      />
      {suggestions !== undefined && (
        <datalist id={listId}>
          {suggestions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </datalist>
      )}
    </>
  )
}
