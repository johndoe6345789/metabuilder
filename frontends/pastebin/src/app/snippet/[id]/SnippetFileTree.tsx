'use client'

import { MaterialIcon } from '@metabuilder/components/m3'
import type { SnippetFileTreeProps } from './snippet-view.types'
import styles from './snippet-view-page.module.scss'

export function SnippetFileTree({
  files,
  activeFile,
  langBgClass,
  renaming,
  renameValue,
  addingFile,
  newFileName,
  snippetTitle,
  newFileInputRef,
  onOpenInTab,
  onSetRenameValue,
  onRenameKeyDown,
  onCommitRename,
  onNewFile,
  onMenuToggle,
  onNewFileNameChange,
  onNewFileKeyDown,
  onCommitNewFile,
}: SnippetFileTreeProps) {
  return (
    <div className={styles.fileTree} aria-label="File explorer">
      <div className={styles.explorerHeader}>
        <span>EXPLORER</span>
        <div className={styles.explorerActions}>
          <button
            className={styles.explorerAction}
            onClick={onNewFile}
            title="New File"
            aria-label="New File"
          >
            <MaterialIcon name="note_add" size={13} />
          </button>
        </div>
      </div>

      <div className={styles.treeRoot}>
        <div className={styles.treeFolder}>
          <MaterialIcon
            name="folder"
            size={13}
            className={styles.folderIcon}
            aria-hidden="true"
          />
          <span className={styles.folderName}>{snippetTitle}</span>
        </div>

        <div className={styles.treeFiles}>
          {files.map(f => (
            <div
              key={f.name}
              className={`${styles.treeFileRow} ${
                f.name === activeFile ? styles.treeFileRowActive : ''
              }`}
            >
              {renaming === f.name ? (
                <input
                  className={styles.renameInput}
                  value={renameValue}
                  onChange={e => onSetRenameValue(e.target.value)}
                  onKeyDown={onRenameKeyDown}
                  onBlur={onCommitRename}
                  autoFocus
                  aria-label={`Rename ${f.name}`}
                  spellCheck={false}
                />
              ) : (
                <>
                  <button
                    className={styles.treeFileBtn}
                    onClick={() => onOpenInTab(f.name)}
                    title={f.name}
                    aria-pressed={f.name === activeFile}
                  >
                    <span
                      className={`${styles.langDot} ${langBgClass}`}
                      aria-hidden="true"
                    />
                    <MaterialIcon
                      name="insert_drive_file"
                      size={12}
                      aria-hidden="true"
                      className={styles.fileIcon}
                    />
                    <span className={styles.fileName}>{f.name}</span>
                  </button>
                  <button
                    className={styles.fileMenuBtn}
                    onClick={e => {
                      e.stopPropagation()
                      const rect = (
                        e.currentTarget as HTMLButtonElement
                      ).getBoundingClientRect()
                      onMenuToggle(f.name, rect)
                    }}
                    title="File actions"
                    aria-label={`Actions for ${f.name}`}
                    aria-haspopup="menu"
                  >
                    <MaterialIcon name="more_vert" size={13} />
                  </button>
                </>
              )}
            </div>
          ))}

          {addingFile && (
            <div className={styles.treeFileRow}>
              <MaterialIcon
                name="insert_drive_file"
                size={12}
                aria-hidden="true"
                className={styles.fileIcon}
              />
              <input
                ref={newFileInputRef}
                className={styles.renameInput}
                placeholder="filename.ext"
                value={newFileName}
                onChange={e => onNewFileNameChange(e.target.value)}
                onKeyDown={onNewFileKeyDown}
                onBlur={onCommitNewFile}
                aria-label="New file name"
                spellCheck={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
