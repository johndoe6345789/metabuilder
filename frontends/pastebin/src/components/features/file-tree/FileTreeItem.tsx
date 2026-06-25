import { Input, MaterialIcon } from '@metabuilder/components/m3'
import { type SnippetFile } from '@/lib/types'
import styles from './FileTree.module.scss'

interface FileTreeItemProps {
  file: SnippetFile
  isActive: boolean
  isRenaming: boolean
  renameValue: string
  renameLabel: string
  deleteLabel: string
  fileCount: number
  onSelect: () => void
  onStartRename: () => void
  onDelete: () => void
  onRenameChange: (v: string) => void
  onRenameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onRenameConfirm: () => void
  onRenameCancel: () => void
}

function FileIcon() {
  return <MaterialIcon name="insert_drive_file" size={14} />
}

export function FileTreeItem({
  file,
  isActive,
  isRenaming,
  renameValue,
  renameLabel,
  deleteLabel,
  fileCount,
  onSelect,
  onStartRename,
  onDelete,
  onRenameChange,
  onRenameKeyDown,
  onRenameConfirm,
  onRenameCancel,
}: FileTreeItemProps) {
  return (
    <li
      className={`${styles.fileItem} ${isActive ? styles.active : ''}`}
      role="option"
      aria-selected={isActive}
      data-testid={`file-tree-item-${file.name}`}
    >
      {isRenaming ? (
        <div className={styles.renameRow}>
          <Input
            value={renameValue}
            onChange={e => onRenameChange(e.target.value)}
            onKeyDown={onRenameKeyDown}
            autoFocus
            className={styles.renameInput}
            aria-label={renameLabel}
            data-testid="file-tree-rename-input"
          />
          <button
            className={styles.iconBtn}
            onClick={onRenameConfirm}
            aria-label="Confirm rename"
          >
            <MaterialIcon name="check" size={12} />
          </button>
          <button
            className={styles.iconBtn}
            onClick={onRenameCancel}
            aria-label="Cancel rename"
          >
            <MaterialIcon name="close" size={12} />
          </button>
        </div>
      ) : (
        <button
          className={styles.fileButton}
          onClick={onSelect}
          onDoubleClick={onStartRename}
          data-testid={`file-tree-btn-${file.name}`}
        >
          <span className={styles.fileIcon}>
            <FileIcon />
          </span>
          <span className={styles.fileName}>{file.name}</span>
        </button>
      )}

      {!isRenaming && (
        <button
          className={`${styles.iconBtn} ${styles.deleteBtn}`}
          onClick={onDelete}
          aria-label={`${deleteLabel} ${file.name}`}
          disabled={fileCount <= 1}
          data-testid={`file-tree-delete-${file.name}`}
        >
          <MaterialIcon name="delete" size={12} />
        </button>
      )}
    </li>
  )
}
