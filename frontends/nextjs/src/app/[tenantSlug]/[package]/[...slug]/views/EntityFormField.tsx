'use client'

import { SOFT_RADIUS } from './radii'
import type { FormField } from './entity-form-fields'

const boxStyle = {
  width: '100%',
  padding: '0.5rem',
  border: '1px solid #e0e0e0',
  borderRadius: SOFT_RADIUS,
}

export interface EntityFormFieldProps {
  field: FormField
  value: string
  onChange: (value: string) => void
}

/** One labelled input, typed the way the field is. */
export function EntityFormField({
  field,
  value,
  onChange,
}: EntityFormFieldProps) {
  const id = `field-${field.name}`
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label
        htmlFor={id}
        style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
      >
        {field.name}
        {field.required === true ? '*' : ''}
      </label>

      {field.kind === 'boolean' ? (
        <select
          id={id}
          value={value}
          style={boxStyle}
          onChange={e => {
            onChange(e.target.value)
          }}
        >
          <option value="">Leave alone</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : field.kind === 'json' ? (
        <textarea
          id={id}
          value={value}
          rows={3}
          placeholder={field.hint ?? 'JSON'}
          style={boxStyle}
          onChange={e => {
            onChange(e.target.value)
          }}
        />
      ) : (
        <input
          id={id}
          type={field.kind === 'number' ? 'number' : 'text'}
          value={value}
          placeholder={field.hint ?? `Enter ${field.name}`}
          style={boxStyle}
          onChange={e => {
            onChange(e.target.value)
          }}
        />
      )}
    </div>
  )
}
