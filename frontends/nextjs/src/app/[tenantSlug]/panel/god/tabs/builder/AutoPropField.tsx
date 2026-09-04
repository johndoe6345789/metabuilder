'use client'

import type { PropField } from '@/components/blocks/block-props'
import type { DropdownConfig } from '../config/use-dropdown-configs'
import { BooleanPropField } from './BooleanPropField'
import { SelectPropField } from './SelectPropField'
import { NumberPropField } from './NumberPropField'
import { TextPropField } from './TextPropField'
import { LinksPropField } from './LinksPropField'

export interface AutoPropFieldProps {
  field: PropField
  current: unknown
  warning?: string
  configs: DropdownConfig[]
  fieldId: string
  onChange: (patch: Record<string, unknown>) => void
}

/** Picks which control renders a field, by its declared or inferred type. */
export function AutoPropField({
  field,
  current,
  warning,
  configs,
  fieldId,
  onChange,
}: AutoPropFieldProps) {
  if (field.type === 'boolean') {
    return (
      <BooleanPropField field={field} current={current} onChange={onChange} />
    )
  }
  if (field.type === 'select') {
    return (
      <SelectPropField
        field={field}
        current={current}
        configs={configs}
        fieldId={fieldId}
        onChange={onChange}
      />
    )
  }
  if (field.type === 'number') {
    return (
      <NumberPropField field={field} current={current} onChange={onChange} />
    )
  }
  if (field.type === 'links') {
    return (
      <LinksPropField field={field} current={current} onChange={onChange} />
    )
  }
  return (
    <TextPropField
      field={field}
      current={current}
      warning={warning}
      configs={configs}
      onChange={onChange}
    />
  )
}
