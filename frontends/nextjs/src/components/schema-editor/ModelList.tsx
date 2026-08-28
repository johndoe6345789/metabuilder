'use client'

import { Typography, IconButton } from '@/m3'
import type { ModelSchema } from './schema-types'
import styles from './ModelList.module.scss'

interface ModelListProps {
  models: ModelSchema[]
  selectedName: string | null
  onSelect: (name: string) => void
  onAdd: () => void
  onDelete: (name: string) => void
}

export function ModelList({
  models,
  selectedName,
  onSelect,
  onAdd,
  onDelete,
}: ModelListProps) {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Typography variant="subtitle2">Models</Typography>
        <IconButton
          size="small"
          onClick={onAdd}
          aria-label="Add model"
          title="New Model"
        >
          +
        </IconButton>
      </div>

      <div className={styles.list}>
        {models.length === 0 && (
          <div className={styles.empty}>
            No models yet — click + to create one.
          </div>
        )}

        {models.map(model => (
          <div
            key={model.name}
            className={`${styles.item} ${
              selectedName === model.name ? styles.itemActive : ''
            }`}
            onClick={() => {
              onSelect(model.name)
            }}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') onSelect(model.name)
            }}
          >
            <div className={styles.itemText}>
              <div className={styles.itemName}>{model.label ?? model.name}</div>
              <div className={styles.itemMeta}>
                {model.fields.length} field
                {model.fields.length !== 1 ? 's' : ''}
              </div>
            </div>
            <IconButton
              size="small"
              aria-label={`Delete model ${model.name}`}
              onClick={e => {
                e.stopPropagation()
                onDelete(model.name)
              }}
            >
              ×
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  )
}
