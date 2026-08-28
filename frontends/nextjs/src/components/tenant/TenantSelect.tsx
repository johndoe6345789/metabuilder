'use client'

import { readList } from '@/lib/dbal/read-list'
import { useEffect, useState } from 'react'
import { FormControl, FormLabel, Select } from '@/m3'
import { DEFAULT_TENANT_ID } from '@/lib/tenant/workspace-paths'

const DBAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

interface UserRow {
  tenantId?: unknown
}

/**
 * Tenants are read from the distinct tenantId values on User rows.
 *
 * There is no Tenant entity to query -- /system/core/tenant answers
 * "Unknown entity" -- so users are the only record that actually carries a
 * tenant. A tenant with no users is therefore invisible here.
 */
async function fetchTenants(): Promise<string[]> {
  const res = await fetch(`${DBAL_URL}/system/core/User?limit=200`, {
    signal: AbortSignal.timeout(6000),
  })
  if (!res.ok) return []
  const json = (await res.json()) as { data?: { data?: UserRow[] } }
  const rows = readList<Record<string, unknown>>(json)
  const ids = rows
    .map(row => (typeof row.tenantId === 'string' ? row.tenantId.trim() : ''))
    .filter(id => id.length > 0)
  return [...new Set(ids)].sort((a, b) => a.localeCompare(b))
}

// One request per page load however many pickers are mounted -- four tabs can
// each render one.
let pending: Promise<string[]> | null = null

function loadTenants(): Promise<string[]> {
  pending ??= fetchTenants().catch(() => [])
  return pending
}

export interface TenantSelectProps {
  value: string
  onChange: (tenantId: string) => void
  /** Required: the label needs a real htmlFor target. */
  id: string
  label?: string
  disabled?: boolean
  className?: string
}

export function TenantSelect({
  value,
  onChange,
  id,
  label = 'Tenant',
  disabled = false,
  className,
}: TenantSelectProps) {
  const [tenants, setTenants] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    void loadTenants().then(ids => {
      if (!cancelled) setTenants(ids)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // The current value and the default are always offered, even when the fetch
  // found neither. A controlled <select> whose value matches no option renders
  // blank and reports a different value than its owner holds, which would
  // quietly retarget whatever the caller is pointing at.
  const candidates = [DEFAULT_TENANT_ID, ...tenants, value]
  const options = [...new Set(candidates.filter(v => v.length > 0))]

  return (
    <FormControl disabled={disabled} className={className}>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <Select
        native
        value={value}
        disabled={disabled}
        inputProps={{ id }}
        onChange={
          ((event: React.ChangeEvent<HTMLSelectElement>) => {
            onChange(event.target.value)
          }) as never
        }
      >
        {options.map(tenantId => (
          <option key={tenantId} value={tenantId}>
            {tenantId}
          </option>
        ))}
      </Select>
    </FormControl>
  )
}
