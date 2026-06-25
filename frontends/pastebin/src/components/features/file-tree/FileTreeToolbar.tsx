import { MaterialIcon } from '@metabuilder/components/m3'
import styles from './FileTree.module.scss'

interface FileTreeToolbarProps {
  title: string
  addLabel: string
  uploadLabel: string
  uploadInputRef: React.RefObject<HTMLInputElement>
  onAddFile: () => void
  onUploadClick: () => void
  onUploadChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function FileTreeToolbar({
  title,
  addLabel,
  uploadLabel,
  uploadInputRef,
  onAddFile,
  onUploadClick,
  onUploadChange,
}: FileTreeToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <span className={styles.toolbarTitle}>{title}</span>
      <div className={styles.toolbarActions}>
        <button
          className={styles.iconBtn}
          onClick={onAddFile}
          aria-label={addLabel}
          title={addLabel}
          data-testid="file-tree-add-btn"
        >
          <MaterialIcon name="add" size={14} />
        </button>
        <button
          className={styles.iconBtn}
          onClick={onUploadClick}
          aria-label={uploadLabel}
          title={uploadLabel}
          data-testid="file-tree-upload-btn"
        >
          <MaterialIcon name="upload" size={14} />
        </button>
        <input
          ref={uploadInputRef}
          type="file"
          className={styles.hiddenInput}
          onChange={onUploadChange}
          aria-hidden="true"
          tabIndex={-1}
          data-testid="file-tree-upload-input"
        />
      </div>
    </div>
  )
}
