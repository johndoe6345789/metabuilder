'use client'

import { Button, Chip, TextField, Typography } from '@/m3'
import type { PublishTarget } from './component-tree-publish'
import s from './ComponentTreeTab.module.scss'

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
}

export function ComponentTreeTargetPicker({
  target,
  onChange,
  onLoad,
  loading,
}: Props) {
  return (
    <div className={s.targetPicker}>
      <TextField
        size="small"
        label="Tenant"
        value={target.tenant}
        onChange={event => {
          onChange({ tenant: event.target.value })
        }}
      />
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
