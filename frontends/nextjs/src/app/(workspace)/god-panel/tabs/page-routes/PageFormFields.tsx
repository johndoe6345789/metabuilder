'use client'

import { TextField, Typography, Chip, Textarea } from '@/m3'
import type { PageRouteInput } from '@/hooks/usePageRoutes'
import s from './PageFormFields.module.scss'

interface PageFormFieldsProps {
  form: Partial<PageRouteInput>
  onChange: <K extends keyof PageRouteInput>(
    field: K,
    value: PageRouteInput[K]
  ) => void
}

// Matches ROLE_LEVELS (src/lib/constants.ts): 0=public, 1=user, 2=moderator,
// 3=admin, 4=god, 5=supergod.
const LEVELS = [
  { value: 0, label: 'Public', desc: 'Anyone can view' },
  { value: 1, label: 'User', desc: 'Logged-in users' },
  { value: 2, label: 'Moderator', desc: 'Moderators and up' },
  { value: 3, label: 'Admin', desc: 'Admin only' },
  { value: 4, label: 'God', desc: 'God tier' },
  { value: 5, label: 'SuperGod', desc: 'SuperGod only' },
]

export function PageFormFields({ form, onChange }: PageFormFieldsProps) {
  const treeStr =
    typeof form.componentTree === 'string'
      ? form.componentTree
      : JSON.stringify({}, null, 2)

  return (
    <div className={s.fields}>
      <TextField
        label="URL Path"
        value={form.path ?? ''}
        onChange={e => {
          onChange('path', e.target.value)
        }}
        placeholder="/about"
        fullWidth
        required
        helperText="Relative path — e.g. /about, /contact"
      />
      <TextField
        label="Page Title"
        value={form.title ?? ''}
        onChange={e => {
          onChange('title', e.target.value)
        }}
        fullWidth
        required
      />

      <div className={s.fieldGroup}>
        <Typography variant="caption" className={s.fieldLabel}>
          Description
        </Typography>
        <Textarea
          value={form.description ?? ''}
          onChange={e => {
            const v = e.target.value
            onChange('description', v.length > 0 ? v : null)
          }}
          rows={2}
          placeholder="Optional page description"
          className={s.textarea}
        />
      </div>

      <div className={s.section}>
        <Typography variant="caption" color="text.secondary">
          Access Level
        </Typography>
        <div className={s.chips}>
          {LEVELS.map(lvl => (
            <Chip
              key={lvl.value}
              label={lvl.label}
              onClick={() => {
                onChange('level', lvl.value)
              }}
              color={form.level === lvl.value ? 'primary' : 'default'}
              variant={form.level === lvl.value ? 'filled' : 'outlined'}
              size="small"
              title={lvl.desc}
            />
          ))}
        </div>
      </div>

      <div className={s.section}>
        <Typography variant="caption" color="text.secondary">
          Visibility
        </Typography>
        <div className={s.chips}>
          <Chip
            label="Public"
            onClick={() => {
              onChange('requiresAuth', false)
            }}
            color={form.requiresAuth !== true ? 'primary' : 'default'}
            variant={form.requiresAuth !== true ? 'filled' : 'outlined'}
            size="small"
          />
          <Chip
            label="Requires login"
            onClick={() => {
              onChange('requiresAuth', true)
            }}
            color={form.requiresAuth === true ? 'primary' : 'default'}
            variant={form.requiresAuth === true ? 'filled' : 'outlined'}
            size="small"
          />
          <Chip
            label="Live"
            onClick={() => {
              onChange('isPublished', true)
            }}
            color={form.isPublished !== false ? 'success' : 'default'}
            variant={form.isPublished !== false ? 'filled' : 'outlined'}
            size="small"
          />
          <Chip
            label="Draft"
            onClick={() => {
              onChange('isPublished', false)
            }}
            color={form.isPublished === false ? 'warning' : 'default'}
            variant={form.isPublished === false ? 'filled' : 'outlined'}
            size="small"
          />
        </div>
      </div>

      <div className={s.fieldGroup}>
        <Typography variant="caption" className={s.fieldLabel}>
          Component Tree (JSON)
        </Typography>
        <Textarea
          value={treeStr}
          onChange={e => {
            onChange('componentTree', e.target.value)
          }}
          rows={10}
          placeholder='{"type":"Box","props":{},"children":[]}'
          className={s.jsonEditor}
        />
        <Typography variant="caption" color="text.secondary">
          JSON component tree definition
        </Typography>
      </div>
    </div>
  )
}
