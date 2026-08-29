'use client'

import {
  Button,
  Chip,
  FormControl,
  FormLabel,
  Select,
  TextField,
  Typography,
} from '@/m3'
import type { PublishTarget } from './component-tree-publish'
import type { PageConfigRow } from './use-page-configs'
import s from './ComponentTreeTab.module.scss'

/** Sentinel for a path that is not one of the saved routes. */
const CUSTOM = '__custom__'

/** 0=public, 1=user, 2=moderator, 3=admin, 4=god, 5=supergod — ROLE_LEVELS */
const LEVELS = [
  { value: 0, label: 'Public' },
  { value: 1, label: 'User' },
  { value: 2, label: 'Moderator' },
  { value: 3, label: 'Admin' },
  { value: 4, label: 'God' },
  { value: 5, label: 'SuperGod' },
]

type Props = {
  target: PublishTarget
  onChange: (patch: Partial<PublishTarget>) => void
  onLoad: () => void
  loading: boolean
  /** Every PageConfig for the tenant; feeds both dropdowns. */
  pages: PageConfigRow[]
  /** Point the editor at a saved route, loading whatever it holds. */
  onPickRoute: (path: string) => void
}

export function ComponentTreeTargetPicker({
  target,
  onChange,
  onLoad,
  loading,
  pages,
  onPickRoute,
}: Props) {
  const known = pages.some(p => p.path === target.path)
  return (
    <div className={s.targetPicker}>
      <FormControl>
        <FormLabel htmlFor="builder-route">Page route</FormLabel>
        <Select
          native
          value={known ? target.path : CUSTOM}
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

      <TextField
        size="small"
        label="Path"
        placeholder="/dashboard/community"
        value={target.path}
        onChange={event => {
          onChange({ path: event.target.value })
        }}
      />
      <TextField
        size="small"
        label="Title"
        value={target.title}
        onChange={event => {
          onChange({ title: event.target.value })
        }}
      />
      <Button
        size="small"
        variant="outlined"
        disabled={loading}
        onClick={onLoad}
      >
        {loading ? 'Loading…' : '↓ Load'}
      </Button>

      <div className={s.targetPickerRow}>
        <Typography variant="caption" color="text.secondary">
          Access level
        </Typography>
        <div className={s.chips}>
          {LEVELS.map(lvl => (
            <Chip
              key={lvl.value}
              label={lvl.label}
              size="small"
              color={target.level === lvl.value ? 'primary' : 'default'}
              variant={target.level === lvl.value ? 'filled' : 'outlined'}
              onClick={() => {
                onChange({ level: lvl.value })
              }}
            />
          ))}
        </div>
      </div>

      <div className={s.targetPickerRow}>
        <Typography variant="caption" color="text.secondary">
          Visibility
        </Typography>
        <div className={s.chips}>
          <Chip
            label="Public"
            size="small"
            color={!target.requiresAuth ? 'primary' : 'default'}
            variant={!target.requiresAuth ? 'filled' : 'outlined'}
            onClick={() => {
              onChange({ requiresAuth: false })
            }}
          />
          <Chip
            label="Requires login"
            size="small"
            color={target.requiresAuth ? 'primary' : 'default'}
            variant={target.requiresAuth ? 'filled' : 'outlined'}
            onClick={() => {
              onChange({ requiresAuth: true })
            }}
          />
        </div>
      </div>
    </div>
  )
}
