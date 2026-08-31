'use client'

import { FormControl, FormLabel, Select } from '@/m3'
import type { PageConfigRow } from './use-page-configs'

/** Sentinel for a path that is not one of the saved routes. */
export const CUSTOM = '__custom__'

export interface RouteSelectProps {
  path: string
  pages: PageConfigRow[]
  onPickRoute: (path: string) => void
}

export function RouteSelect({ path, pages, onPickRoute }: RouteSelectProps) {
  const known = pages.some(p => p.path === path)
  return (
    <FormControl>
      <FormLabel htmlFor="builder-route">Page route</FormLabel>
      <Select
        native
        value={known ? path : CUSTOM}
        inputProps={{ id: 'builder-route' }}
        onChange={
          ((event: React.ChangeEvent<HTMLSelectElement>) => {
            if (event.target.value !== CUSTOM) onPickRoute(event.target.value)
          }) as never
        }
      >
        {/* Kept so a route that does not exist yet can still be typed
        below. */}
        <option value={CUSTOM}>Custom…</option>
        {pages.map(p => (
          <option key={p.id} value={p.path}>
            {p.path}
            {p.hasTree ? '  (tree)' : ''}
          </option>
        ))}
      </Select>
    </FormControl>
  )
}
