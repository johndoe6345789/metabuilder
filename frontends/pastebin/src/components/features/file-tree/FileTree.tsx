'use client'

import { useRef, useState } from 'react'
import { Button, Input, MaterialIcon } from '@metabuilder/components/fakemui'
import { type SnippetFile } from '@/lib/types'
import { useTranslation } from '@/hooks/useTranslation'
import styles from './FileTree.module.scss'

interface FileTreeProps {
  files: SnippetFile[]
  activeFile: string
  onFileSelect: (name: string) => void
  onFileAdd: (name: string, content?: string) => void
  onFileDelete: (name: string) => void
  onFileRename: (oldName: string, newName: string) => void
  onFileUpload: (file: File) => void
}

function fileIcon(_name: string) {
  return <MaterialIcon name="insert_drive_file" size={14} />
}

export function FileTree({
  files,
  activeFile,
  onFileSelect,
  onFileAdd,
  onFileDelete,
  onFileRename,
  onFileUpload,
}: FileTreeProps) {
  const t = useTranslation()
  const ft = t.fileTree
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [addingFile, setAddingFile] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  function commitAdd() {
    const name = newFileName.trim()
    if (name) onFileAdd(name)
    setAddingFile(false)
    setNewFileName('')
  }

  function commitRename() {
    const name = renameValue.trim()
    if (name && renamingFile && name !== renamingFile) {
      onFileRename(renamingFile, name)
    }
    setRenamingFile(null)
    setRenameValue('')
  }

  function handleUploadChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFileUpload(file)
    e.target.value = ''
  }

  return (
    <div className={styles.fileTree} data-testid="file-tree" role="navigation" aria-label="Project files">
      <div className={styles.toolbar}>
        <span className={styles.toolbarTitle}>{ft.title}</span>
        <div className={styles.toolbarActions}>
          <button
            className={styles.iconBtn}
            onClick={() => setAddingFile(true)}
            aria-label={ft.addFile}
            title={ft.addFile}
            data-testid="file-tree-add-btn"
          >
            <MaterialIcon name="add" size={14} />
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => uploadInputRef.current?.click()}
            aria-label={ft.uploadFile}
            title={ft.uploadFile}
            data-testid="file-tree-upload-btn"
          >
            <MaterialIcon name="upload" size={14} />
          </button>
          <input
            ref={uploadInputRef}
            type="file"
            className={styles.hiddenInput}
            onChange={handleUploadChange}
            aria-hidden="true"
            tabIndex={-1}
            data-testid="file-tree-upload-input"
          />
        </div>
      </div>

      <ul className={styles.fileList} role="listbox" aria-label="Files">
        {files.length === 0 && (
          <li className={styles.emptyState} data-testid="file-tree-empty">{ft.noFiles}</li>
        )}

        {files.map((file) => (
          <li
            key={file.name}
            className={`${styles.fileItem} ${activeFile === file.name ? styles.active : ''}`}
            role="option"
            aria-selected={activeFile === file.name}
            data-testid={`file-tree-item-${file.name}`}
          >
            {renamingFile === file.name ? (
              <div className={styles.renameRow}>
                <Input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename()
                    if (e.key === 'Escape') { setRenamingFile(null); setRenameValue('') }
                  }}
                  autoFocus
                  className={styles.renameInput}
                  aria-label={ft.rename}
                  data-testid="file-tree-rename-input"
                />
                <button className={styles.iconBtn} onClick={commitRename} aria-label="Confirm rename">
                  <MaterialIcon name="check" size={12} />
                </button>
                <button className={styles.iconBtn} onClick={() => { setRenamingFile(null); setRenameValue('') }} aria-label="Cancel rename">
                  <MaterialIcon name="close" size={12} />
                </button>
              </div>
            ) : (
              <button
                className={styles.fileButton}
                onClick={() => onFileSelect(file.name)}
                onDoubleClick={() => { setRenamingFile(file.name); setRenameValue(file.name) }}
                data-testid={`file-tree-btn-${file.name}`}
              >
                <span className={styles.fileIcon}>{fileIcon(file.name)}</span>
                <span className={styles.fileName}>{file.name}</span>
              </button>
            )}

            {renamingFile !== file.name && (
              <button
                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                onClick={() => onFileDelete(file.name)}
                aria-label={`${ft.deleteFile} ${file.name}`}
                disabled={files.length <= 1}
                data-testid={`file-tree-delete-${file.name}`}
              >
                <MaterialIcon name="delete" size={12} />
              </button>
            )}
          </li>
        ))}

        {addingFile && (
          <li className={styles.addingRow} data-testid="file-tree-adding-row">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitAdd()
                if (e.key === 'Escape') { setAddingFile(false); setNewFileName('') }
              }}
              placeholder={ft.newFileName}
              autoFocus
              className={styles.addInput}
              aria-label={ft.newFileName}
              data-testid="file-tree-new-name-input"
            />
            <button className={styles.iconBtn} onClick={commitAdd} aria-label="Confirm add">
              <MaterialIcon name="check" size={12} />
            </button>
            <button className={styles.iconBtn} onClick={() => { setAddingFile(false); setNewFileName('') }} aria-label="Cancel add">
              <MaterialIcon name="close" size={12} />
            </button>
          </li>
        )}
      </ul>
    </div>
  )
}
