'use client'

import { Button, Chip, FormControl, FormLabel, Select, TextField, Typography } from '@/m3'
import type { PublishTarget } from './component-tree-publish'
import type { PageConfigRow } from './use-page-configs'
import s from './ComponentTreeTab.module.scss'
import { TenantSelect } from '@/components/tenant/TenantSelect'

/** Sentinel for "not one of the saved routes / trees". */
const CUSTOM = '__custom__'
const BLANK = '__blank__'

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
  /** Load a specific saved tree, or start from an empty one. */
  onPickTree: (path: string | null) => void
}

export function ComponentTreeTargetPicker({
  target,
  onChange,
  onLoad,
  loading,
  pages,
  onPickRoute,
  onPickTree,
}: Props) {
  const known = pages.some(p => p.path === target.path)
  const trees = pages.filter(p => p.hasTree)
  return (
    <div className={s.targetPicker}>
      <TenantSelect
        id="builder-target-tenant"
        value={target.tenant}
        onChange={tenant => {
          onChange({ tenant })
        }}
      />
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
          {/* Kept so a route that does not exist yet can still be typed below. */}
          <option value={CUSTOM}>Custom…</option>
          {pages.map(p => (
            <option key={p.id} value={p.path}>
              {p.path}
              {p.hasTree ? '  (tree)' : ''}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="builder-tree">Component tree</FormLabel>
        <Select
          native
          value={trees.some(t => t.path === target.path) ? target.path : BLANK}
          inputProps={{ id: 'builder-tree' }}
          onChange={
            ((event: React.ChangeEvent<HTMLSelectElement>) => {
              const v = event.target.value
              onPickTree(v === BLANK ? null : v)
            }) as never
          }
        >
          <option value={BLANK}>
            {trees.length > 0 ? 'Blank tree' : 'Blank tree — none saved yet'}
          </option>
          {trees.map(t => (
            <option key={t.id} value={t.path}>
              {t.title} — {t.path}
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
