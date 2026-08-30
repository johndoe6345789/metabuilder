'use client'

import { Button, TextField, Typography } from '@/m3'
import type { EditDraft } from '../use-package-manager-ui'
import { CATEGORIES, ICONS } from './constants'
import { ChipPicker } from './ChipPicker'
import { IconPicker } from './IconPicker'
import s from '../PackageManager.module.scss'

export interface PackageEditFormProps {
  draft: EditDraft
  onPatch: (patch: Partial<EditDraft>) => void
  onSave: () => void
  onCancel: () => void
}

/** The editing card: name, description, category and icon. */
export function PackageEditForm({
  draft,
  onPatch,
  onSave,
  onCancel,
}: PackageEditFormProps) {
  return (
    <div className={s.editForm}>
      <TextField
        size="small"
        label="Name"
        value={draft.name}
        onChange={e => {
          onPatch({ name: e.target.value })
        }}
      />
      <TextField
        size="small"
        label="Description"
        value={draft.description}
        onChange={e => {
          onPatch({ description: e.target.value })
        }}
      />

      <Typography variant="caption" color="text.secondary">
        Category
      </Typography>
      <ChipPicker
        options={CATEGORIES}
        value={draft.category}
        onChange={cat => {
          onPatch({ category: cat })
        }}
      />

      <Typography variant="caption" color="text.secondary">
        Icon
      </Typography>
      <IconPicker
        options={ICONS}
        value={draft.icon}
        onChange={icon => {
          onPatch({ icon })
        }}
      />

      <div className={s.row}>
        <Button size="small" variant="contained" onClick={onSave}>
          Save
        </Button>
        <Button size="small" variant="text" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
