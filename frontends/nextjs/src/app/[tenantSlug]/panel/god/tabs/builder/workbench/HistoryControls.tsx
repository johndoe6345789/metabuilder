'use client'

import s from '../ComponentTreeTab.module.scss'

export interface HistoryControlsProps {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

/** Undo/redo, mirroring the ⌘Z / ⇧⌘Z shortcuts. */
export function HistoryControls(props: HistoryControlsProps) {
  return (
    <div className={s.history}>
      <button
        type="button"
        className={s.historyBtn}
        disabled={!props.canUndo}
        aria-label="Undo"
        title="Undo (⌘Z)"
        onClick={props.onUndo}
      >
        <span className="material-symbols-rounded" aria-hidden="true">
          undo
        </span>
        Undo
      </button>
      <button
        type="button"
        className={s.historyBtn}
        disabled={!props.canRedo}
        aria-label="Redo"
        title="Redo (⇧⌘Z)"
        onClick={props.onRedo}
      >
        <span className="material-symbols-rounded" aria-hidden="true">
          redo
        </span>
        Redo
      </button>
    </div>
  )
}
