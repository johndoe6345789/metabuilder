'use client'

import { useState } from 'react'
import { useSchemaEditor } from './useSchemaEditor'
import { ModelList } from './ModelList'
import { FieldEditor, FieldEditorPlaceholder } from './FieldEditor'
import { SchemaEditorLoading } from './SchemaEditorLoading'
import { useModelActions } from './use-model-actions'
import styles from './SchemaEditor.module.scss'

interface SchemaEditorProps {
  tenantId?: string
}

export function SchemaEditor({ tenantId = 'system' }: SchemaEditorProps) {
  const { models, loading, offline, saveModels } = useSchemaEditor(tenantId)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const selectedModel = models.find(m => m.name === selectedName) ?? null

  const { handleAdd, handleDelete, handleSaveModel } = useModelActions({
    models,
    selectedName,
    setSelectedName,
    saveModels,
  })

  if (loading) return <SchemaEditorLoading />

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
