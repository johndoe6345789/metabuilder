'use client'

import { TextField, Typography, Textarea } from '@/m3'
import type { PageRouteInput } from '@/hooks/usePageRoutes'
import type { PageFormOnChange } from './page-form-field-types'
import s from './PageFormFields.module.scss'

export interface PageFormBasicFieldsProps {
  form: Partial<PageRouteInput>
  onChange: PageFormOnChange
}

export function PageFormBasicFields({
  form,
  onChange,
}: PageFormBasicFieldsProps) {
  return (
    <>
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
    </>
  )
}
