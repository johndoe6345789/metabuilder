'use client'

import type { HttpMethod } from '../types'
import styles from '../QueryConsole.module.scss'

export interface GuiPanelProps {
  method: HttpMethod
  tenant: string
  pkg: string
  entity: string
  entityId: string
  queryParams: string
  body: string
  loading: boolean
  pathPreview: string
  onMethodChange: (m: HttpMethod) => void
  onTenantChange: (v: string) => void
  onPkgChange: (v: string) => void
  onEntityChange: (v: string) => void
  onEntityIdChange: (v: string) => void
  onQueryParamsChange: (v: string) => void
  onBodyChange: (v: string) => void
  onExecute: () => void
}

export interface GuiFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  full?: boolean
}

export function GuiField({
  label, value, onChange, placeholder, full = false,
}: GuiFieldProps) {
  return (
    <div className={full ? styles.fieldFull : styles.field}>
      <label className={styles.label}>{label}</label>
      <input
        className={styles.input}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
