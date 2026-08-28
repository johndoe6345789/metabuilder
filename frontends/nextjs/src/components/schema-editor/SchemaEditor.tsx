'use client'

import { useState } from 'react'
import { Typography, CircularProgress } from '@/m3'
import { useSchemaEditor } from './useSchemaEditor'
import { ModelList } from './ModelList'
import { FieldEditor, FieldEditorPlaceholder } from './FieldEditor'
import type { ModelSchema } from './schema-types'
import styles from './SchemaEditor.module.scss'

interface SchemaEditorProps {
  tenantId?: string
}

function makeNewModel(): ModelSchema {
  return {
    name: `model_${Date.now()}`,
    label: 'New Model',
    fields: [],
  }
}

export function SchemaEditor({ tenantId = 'system' }: SchemaEditorProps) {
  const { models, loading, offline, saveModels } = useSchemaEditor(tenantId)
  const [selectedName, setSelectedName] = useState<string | null>(null)

  const selectedModel = models.find(m => m.name === selectedName) ?? null

  function handleAdd() {
    const m = makeNewModel()
    const next = [...models, m]
    void saveModels(next)
    setSelectedName(m.name)
  }

  function handleDelete(name: string) {
    const next = models.filter(m => m.name !== name)
    void saveModels(next)
    if (selectedName === name) {
      const first = next[0]
      setSelectedName(first !== undefined ? first.name : null)
    }
  }

  function handleSaveModel(updated: ModelSchema) {
    const next = models.map(m => (m.name === selectedName ? updated : m))
    void saveModels(next)
    setSelectedName(updated.name)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Loading schemas…
        </Typography>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      {offline && (
        <span className={styles.offlineBadge}>
          Offline — changes saved locally only
        </span>
      )}

      <div className={styles.grid}>
        <div className={styles.leftPanel}>
          <ModelList
            models={models}
            selectedName={selectedName}
            onSelect={setSelectedName}
            onAdd={handleAdd}
            onDelete={handleDelete}
          />
        </div>

        <div className={styles.rightPanel}>
          {selectedModel !== null ? (
            <FieldEditor
              key={selectedModel.name}
              model={selectedModel}
              allModelNames={models.map(m => m.name)}
              onSave={handleSaveModel}
            />
          ) : (
            <FieldEditorPlaceholder />
          )}
        </div>
      </div>
    </div>
  )
}
