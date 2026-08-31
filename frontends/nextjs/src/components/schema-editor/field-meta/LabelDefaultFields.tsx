'use client'

import { TextField } from '@/m3'
import type { FieldSchema } from '../schema-types'
import styles from '../AddFieldDialog.module.scss'

export interface LabelDefaultFieldsProps {
  field: FieldSchema
  patch: (u: Partial<FieldSchema>) => void
}

export function LabelDefaultFields({ field, patch }: LabelDefaultFieldsProps) {
  return (
    <div className={styles.row}>
      <div className={styles.fullRow}>
        <div className={styles.label}>Label</div>
        <TextField
          size="small"
          value={field.label ?? ''}
          onChange={e => {
            patch({ label: e.target.value })
          }}
          placeholder="Display label"
        />
      </div>
      <div className={styles.fullRow}>
        <div className={styles.label}>Default Value</div>
        <TextField
          size="small"
          value={field.default ?? ''}
          onChange={e => {
            patch({ default: e.target.value })
          }}
          placeholder="Default"
        />
      </div>
    </div>
  )
}
