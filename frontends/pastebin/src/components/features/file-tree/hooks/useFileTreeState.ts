import { useRef, useState } from 'react'

export function useFileTreeState() {
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [addingFile, setAddingFile] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  function commitAdd(onFileAdd: (name: string, content?: string) => void) {
    const name = newFileName.trim()
    if (name) onFileAdd(name)
    setAddingFile(false)
    setNewFileName('')
  }

  function commitRename(
    onFileRename: (oldName: string, newName: string) => void,
  ) {
    const name = renameValue.trim()
    if (name && renamingFile && name !== renamingFile) {
      onFileRename(renamingFile, name)
    }
    setRenamingFile(null)
    setRenameValue('')
  }

  return {
    uploadInputRef,
    addingFile,
    newFileName,
    renamingFile,
    renameValue,
    setAddingFile,
    setNewFileName,
    setRenamingFile,
    setRenameValue,
    commitAdd,
    commitRename,
  }
}
