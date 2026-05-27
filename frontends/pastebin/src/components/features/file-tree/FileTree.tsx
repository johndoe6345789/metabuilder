'use client'

import { type SnippetFile } from '@/lib/types'
import { useTranslation } from '@/hooks/useTranslation'
import { useFileTreeState } from './hooks/useFileTreeState'
import { FileTreeItem } from './FileTreeItem'
import { FileTreeAddRow } from './FileTreeAddRow'
import { FileTreeToolbar } from './FileTreeToolbar'
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
  const vm = useFileTreeState()

  function handleUploadChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0]
    if (file) onFileUpload(file)
    e.target.value = ''
  }

  return (
    <div
      className={styles.fileTree}
      data-testid="file-tree"
      role="navigation"
      aria-label="Project files"
    >
      <FileTreeToolbar
        title={ft.title}
        addLabel={ft.addFile}
        uploadLabel={ft.uploadFile}
        uploadInputRef={vm.uploadInputRef}
        onAddFile={() => vm.setAddingFile(true)}
        onUploadClick={() => vm.uploadInputRef.current?.click()}
        onUploadChange={handleUploadChange}
      />

      <ul className={styles.fileList} role="listbox" aria-label="Files">
        {files.length === 0 && (
          <li className={styles.emptyState} data-testid="file-tree-empty">
            {ft.noFiles}
          </li>
        )}

        {files.map(file => (
          <FileTreeItem
            key={file.name}
            file={file}
            isActive={activeFile === file.name}
            isRenaming={vm.renamingFile === file.name}
            renameValue={vm.renameValue}
            renameLabel={ft.rename}
            deleteLabel={ft.deleteFile}
            fileCount={files.length}
            onSelect={() => onFileSelect(file.name)}
            onStartRename={() => {
              vm.setRenamingFile(file.name)
              vm.setRenameValue(file.name)
            }}
            onDelete={() => onFileDelete(file.name)}
            onRenameChange={vm.setRenameValue}
            onRenameKeyDown={e => {
              if (e.key === 'Enter') vm.commitRename(onFileRename)
              if (e.key === 'Escape') {
                vm.setRenamingFile(null)
                vm.setRenameValue('')
              }
            }}
            onRenameConfirm={() => vm.commitRename(onFileRename)}
            onRenameCancel={() => {
              vm.setRenamingFile(null)
              vm.setRenameValue('')
            }}
          />
        ))}

        {vm.addingFile && (
          <FileTreeAddRow
            newFileName={vm.newFileName}
            placeholder={ft.newFileName}
            label={ft.newFileName}
            onChange={vm.setNewFileName}
            onKeyDown={e => {
              if (e.key === 'Enter') vm.commitAdd(onFileAdd)
              if (e.key === 'Escape') {
                vm.setAddingFile(false)
                vm.setNewFileName('')
              }
            }}
            onConfirm={() => vm.commitAdd(onFileAdd)}
            onCancel={() => {
              vm.setAddingFile(false)
              vm.setNewFileName('')
            }}
          />
        )}
      </ul>
    </div>
  )
}
