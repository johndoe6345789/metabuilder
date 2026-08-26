'use client'

/** Reorderable list of items a package references (workflows, pages).
 * Drag-and-drop reuses the same raw HTML5 draggable/onDragStart/onDragOver/
 * onDrop pattern ComponentTreeOutline.tsx uses for component-tree nodes --
 * the only DnD precedent in this app, no dnd-kit/react-dnd dependency
 * added. A remove button sits alongside the drag handle rather than instead
 * of it: drag-only add/remove is bad accessibility practice regardless of
 * what's asked for as the primary interaction. */

import type { PackageRef } from './use-package-registry'
import s from './PackageContentsList.module.scss'

interface PackageContentsListProps {
  items: PackageRef[]
  onReorder: (from: number, to: number) => void
  onRemove: (id: string) => void
}

export function PackageContentsList({
  items,
  onReorder,
  onRemove,
}: PackageContentsListProps) {
  if (items.length === 0) {
    return <p className={s.empty}>Nothing added yet.</p>
  }

  return (
    <div className={s.list}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={s.row}
          draggable
          onDragStart={event => {
            event.dataTransfer.setData('text/plain', String(index))
          }}
          onDragOver={event => {
            event.preventDefault()
          }}
          onDrop={event => {
            event.preventDefault()
            const from = Number(event.dataTransfer.getData('text/plain'))
            if (!Number.isNaN(from) && from !== index) onReorder(from, index)
          }}
        >
          <span className={s.grip}>⠿</span>
          <span className={s.label}>{item.label}</span>
          <button
            type="button"
            className={s.remove}
            onClick={() => {
              onRemove(item.id)
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
