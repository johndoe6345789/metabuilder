'use client'

import { FormControl, FormLabel, Select, Typography } from '@/m3'
import type { PropField } from '@/components/blocks/block-props'
import type { DropdownConfig } from '../config/use-dropdown-configs'
import s from './ComponentTreeTab.module.scss'

export interface SelectPropFieldProps {
  field: PropField
  current: unknown
  configs: DropdownConfig[]
  fieldId: string
  onChange: (patch: Record<string, unknown>) => void
}

export function SelectPropField({
  field,
  current,
  configs,
  fieldId,
  onChange,
}: SelectPropFieldProps) {
  // The tenant's own list wins over the built-in choices.
  const custom =
    field.source === undefined
      ? undefined
      : configs.find(c => c.name === field.source)
  const options = custom?.options ?? field.options ?? []
  const value = typeof current === 'string' ? current : ''
  // With nothing stored, a native select shows its first option -- so the
  // panel claims a value the block does not have, and the two only agree
  // by luck of the render fallback matching the first option. An explicit
  // empty entry keeps "unset" sayable and visible.
  const unset = !options.some(option => option.value === value)

  return (
    <FormControl>
      <FormLabel htmlFor={fieldId}>{field.label}</FormLabel>
      <Select
        native
        value={value}
        inputProps={{ id: fieldId }}
        onChange={
          ((event: React.ChangeEvent<HTMLSelectElement>) => {
            onChange({ [field.name]: event.target.value })
          }) as never
        }
      >
        {unset && <option value="">Not set</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {field.hint !== undefined && (
        <Typography variant="caption" className={s.propHint}>
          {field.hint}
        </Typography>
      )}
    </FormControl>
  )
}
