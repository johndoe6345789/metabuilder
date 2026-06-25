'use client'

import { MaterialIcon } from '@metabuilder/components/m3'
import { useFileMenuDismiss } from './hooks/useFileMenuDismiss'
import styles from './file-menu.module.scss'

interface FileMenuProps {
  anchorRect: DOMRect
  canDelete: boolean
  onClose: () => void
  onRename: () => void
  onDuplicate: () => void
  onDelete: () => void
  onCopyPath: () => void
  onOpenInNewTab: () => void
}

export function FileMenu({
  anchorRect,
  canDelete,
  onClose,
  onRename,
  onDuplicate,
  onDelete,
  onCopyPath,
  onOpenInNewTab,
}: FileMenuProps) {
  const ref = useFileMenuDismiss(onClose)

  // Prefer opening below the button; flip up if near the bottom of viewport
  const spaceBelow = window.innerHeight - anchorRect.bottom
  const top =
    // eslint-disable-next-line max-len
    spaceBelow > 160 ? anchorRect.bottom + 2 : anchorRect.top - 2 - 140 // approximate menu height

  return (
    <div
      ref={ref}
      className={styles.menu}
      style={{ top, left: anchorRect.left }}
      role="menu"
    >
      <button
        className={styles.item}
        role="menuitem"
        onClick={() => {
          onOpenInNewTab()
          onClose()
        }}
      >
        <MaterialIcon name="open_in_new" size={13} />
        <span>Open in New Tab</span>
      </button>

      <button
        className={styles.item}
        role="menuitem"
        onClick={() => {
          onRename()
          onClose()
        }}
      >
        <MaterialIcon name="edit" size={13} />
        <span>Rename</span>
        <span className={styles.shortcut}>F2</span>
      </button>

      <button
        className={styles.item}
        role="menuitem"
        onClick={() => {
          onDuplicate()
          onClose()
        }}
      >
        <MaterialIcon name="content_copy" size={13} />
        <span>Duplicate</span>
      </button>

      <button
        className={styles.item}
        role="menuitem"
        onClick={() => {
          onCopyPath()
          onClose()
        }}
      >
        <MaterialIcon name="link" size={13} />
        <span>Copy Path</span>
      </button>

      <div className={styles.sep} aria-hidden="true" />

      <button
        className={`${styles.item} ${styles.itemDanger}`}
        role="menuitem"
        onClick={() => {
          onDelete()
          onClose()
        }}
        disabled={!canDelete}
        title={!canDelete ? 'Cannot delete the last file' : undefined}
      >
        <MaterialIcon name="delete" size={13} />
        <span>Delete</span>
      </button>
    </div>
  )
}
