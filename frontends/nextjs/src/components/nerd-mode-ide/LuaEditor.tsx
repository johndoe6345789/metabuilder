'use client'

import { Button } from '@/m3'
import { MonacoPane } from './MonacoPane'
import { LuaScriptList } from './LuaScriptList'
import { useLuaScripts } from './useLuaScripts'
import type { OpenFile } from './ide-types'
import s from './LuaEditor.module.scss'

export function LuaEditor() {
  const {
    scripts,
    selectedId,
    selected,
    setSelectedId,
    addScript,
    updateName,
    save,
  } = useLuaScripts()

  const openFile: OpenFile | null = selected != null
    ? { path: selected.id, language: 'lua', content: selected.code }
    : null

  return (
    <div className={s.wrap}>
      <LuaScriptList
        scripts={scripts}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAdd={addScript}
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
          <div className={s.empty}>Create a script to start</div>
        )}
      </div>
    </div>
  )
}
