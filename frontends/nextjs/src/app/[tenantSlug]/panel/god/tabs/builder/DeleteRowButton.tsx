'use client'

import s from './ComponentTreeTab.module.scss'

export interface DeleteRowButtonProps {
  id: string
  name: string
  hasChildren: boolean
  onDelete: (id: string) => void
}

/** The row's own delete control. A leaf costs nothing to lose -- Undo
 *  covers it. A node with descendants can silently take a whole subtree
 *  with it, which is exactly the kind of mistake a mis-click on a crowded
 *  row makes easy, so that case alone asks first. */
export function DeleteRowButton({
  id,
  name,
  hasChildren,
  onDelete,
}: DeleteRowButtonProps) {
  return (
    <button
      className={s.del}
      onClick={event => {
        event.stopPropagation()
        const prompt = `Delete this ${name} and everything inside it?`
        if (hasChildren && !window.confirm(prompt)) return
        onDelete(id)
      }}
    >
      ✕
    </button>
  )
}
