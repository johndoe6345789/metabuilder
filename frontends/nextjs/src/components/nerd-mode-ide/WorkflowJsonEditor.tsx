'use client'

import { Button } from '@/m3'
import { MonacoPane } from './MonacoPane'
import { WorkflowJsonList } from './WorkflowJsonList'
import { useWorkflowJsonAssets } from './useWorkflowJsonAssets'
import type { OpenFile } from './ide-types'
import s from './WorkflowJsonEditor.module.scss'

export function WorkflowJsonEditor() {
  const {
    assets,
    selectedId,
    selected,
    setSelectedId,
    addAsset,
    updateName,
    save,
  } = useWorkflowJsonAssets()

  const openFile: OpenFile | null = selected != null
    ? { path: selected.id, language: 'json', content: selected.code }
    : null

  return (
    <div className={s.wrap}>
      <WorkflowJsonList
        assets={assets}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAdd={addAsset}
      />
      <div className={s.main}>
        {selected != null ? (
          <>
            <div className={s.editorToolbar}>
              <input
                className={s.nameInput}
                value={selected.name}
                onChange={(e) => {
                  updateName(e.target.value, selectedId)
                }}
              />
              <Button size="small" variant="contained" onClick={save}>
                Save
              </Button>
            </div>
            <div className={s.editorArea}>
              {openFile != null && <MonacoPane file={openFile} />}
            </div>
          </>
        ) : (
          <div className={s.empty}>Create a workflow JSON asset to start</div>
        )}
      </div>
    </div>
  )
}
