'use client'

import { useState } from 'react'
import { useSchemaEditor } from './useSchemaEditor'
import { ModelList } from './ModelList'
import { FieldEditor, FieldEditorPlaceholder } from './FieldEditor'
import { SchemaEditorLoading } from './SchemaEditorLoading'
import { useModelActions } from './use-model-actions'
import {
  withOwnClass,
  type BlockAttrs,
} from '@/components/blocks/common-attrs'
import styles from './SchemaEditor.module.scss'

interface SchemaEditorProps {
  tenantId?: string
  /** Identity, class and aria set on the block, when this editor was placed
   *  in a page tree rather than opened from its own God Panel tab. */
  attrs?: BlockAttrs
}

export function SchemaEditor({
  tenantId = 'system',
  attrs = {},
}: SchemaEditorProps) {
  const { models, loading, offline, saveModels } = useSchemaEditor(tenantId)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const selectedModel = models.find(m => m.name === selectedName) ?? null

  const { handleAdd, handleDelete, handleSaveModel } = useModelActions({
    models,
    selectedName,
    setSelectedName,
    saveModels,
  })

  // Loading changes what the editor shows, not what it is. Returning the
  // placeholder instead of the root made the block a different element for
  // its first second, so anything the author had set on it -- id, class,
  // aria -- was absent exactly while the page was settling.
  return (
    <div {...withOwnClass(styles.root, attrs)}>
      {loading ? (
        <SchemaEditorLoading />
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
