'use client'

import s from '../CredentialsTab.module.scss'

export interface TenantSelectProps {
  label: string
  value: string
  options: string[]
  includeAll?: boolean
  onChange: (value: string) => void
}

/** One tenant picker, used for both the view scope and the write target. */
export function TenantSelect({
  label,
  value,
  options,
  includeAll = false,
  onChange,
}: TenantSelectProps) {
  return (
    <label className={s.fieldLabel}>
      {label}
      <select
        className={s.select}
        value={value}
        onChange={event => {
          onChange(event.target.value)
        }}
      >
        {includeAll && <option value="all">All tenants</option>}
        {options.map(tenant => (
          <option key={tenant} value={tenant}>
            {tenant}
          </option>
        ))}
      </select>
    </label>
  )
}
