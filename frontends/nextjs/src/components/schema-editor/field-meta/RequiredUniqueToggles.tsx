'use client'

import { Switch } from '@/m3'
import type { FieldSchema } from '../schema-types'
import styles from '../AddFieldDialog.module.scss'

export interface RequiredUniqueTogglesProps {
  field: FieldSchema
  patch: (u: Partial<FieldSchema>) => void
}

export function RequiredUniqueToggles({
  field,
  patch,
}: RequiredUniqueTogglesProps) {
  return (
    <div className={styles.toggleRow}>
      <label className={styles.toggleItem}>
        <Switch
          checked={field.required ?? false}
          onChange={e => {
            patch({ required: e.target.checked })
          }}
        />
        Required
      </label>
      <label className={styles.toggleItem}>
        <Switch
          checked={field.unique ?? false}
          onChange={e => {
            patch({ unique: e.target.checked })
          }}
        />
        Unique
      </label>
    </div>
  )
}
