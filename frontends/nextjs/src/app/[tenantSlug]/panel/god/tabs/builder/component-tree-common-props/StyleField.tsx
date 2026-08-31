'use client'

import { ComponentTreeClassPicker } from '../ComponentTreeClassPicker'
import { text } from './text'

export interface StyleFieldProps {
  props: Record<string, unknown>
  tenant: string
  onChange: (patch: Record<string, unknown>) => void
}

export function StyleField({ props, tenant, onChange }: StyleFieldProps) {
  return (
    <ComponentTreeClassPicker
      value={text(props.className)}
      tenant={tenant}
      onChange={className => {
        onChange({ className })
      }}
    />
  )
}
