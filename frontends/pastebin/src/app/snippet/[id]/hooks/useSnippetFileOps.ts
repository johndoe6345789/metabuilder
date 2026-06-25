/**
 * File operation handlers for snippet view page
 */

import { useRef, useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { updateSnippet } from '@/store/slices/snippetsSlice'
import { toast } from '@metabuilder/components/m3'
import { Snippet } from '@/lib/types'

type FileList = { name: string; content: string }[]

export function useSnippetFileOps(snippet: Snippet | null) {
  const dispatch = useAppDispatch()
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [addingFile, setAddingFile] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const newFileInputRef = useRef<HTMLInputElement>(null)

  const handleNewFile = () => {
    setAddingFile(true)
    setNewFileName('')
    setTimeout(() => newFileInputRef.current?.focus(), 10)
  }

  const commitNewFile = async (files: FileList, _filename: string) => {
    const name = newFileName.trim()
    setAddingFile(false)
    if (!name || !snippet) return
    if (files.some(f => f.name === name)) {
      toast.error(`File "${name}" already exists`)
      return
    }
    try {
      await dispatch(
        updateSnippet({
          ...snippet,
          files: [...files, { name, content: '' }],
        }),
      ).unwrap()
      return name
    } catch {
      toast.error('Failed to create file')
    }
  }

  const handleStartRename = (name: string) => {
    setRenaming(name)
    setRenameValue(name)
  }

  const commitRename = async (
    files: FileList,
    activeFile: string,
    onRename: (from: string, to: string) => void,
  ) => {
    const oldName = renaming
    setRenaming(null)
    if (!oldName || !snippet) return
    const newName = renameValue.trim()
    if (!newName || newName === oldName) return
    if (files.some(f => f.name === newName)) {
      toast.error(`File "${newName}" already exists`)
      return
    }
    const newFiles = files.map(f =>
      f.name === oldName ? { ...f, name: newName } : f,
    )
    const newEntry =
      snippet.entryPoint === oldName ? newName : snippet.entryPoint
    try {
      await dispatch(
        updateSnippet({ ...snippet, files: newFiles, entryPoint: newEntry }),
      ).unwrap()
      if (activeFile === oldName) onRename(oldName, newName)
    } catch {
      toast.error('Failed to rename file')
    }
  }

  const handleDeleteFile = async (
    name: string,
    files: FileList,
    onDeleted: (newActive: string) => void,
  ) => {
    if (!snippet) return
    if (files.length <= 1) {
      toast.error('Cannot delete the last file')
      return
    }
    const newFiles = files.filter(f => f.name !== name)
    const newEntry =
      snippet.entryPoint === name ? newFiles[0]?.name : snippet.entryPoint
    try {
      await dispatch(
        updateSnippet({ ...snippet, files: newFiles, entryPoint: newEntry }),
      ).unwrap()
      onDeleted(newFiles[0]?.name ?? '')
      toast.success(`Deleted ${name}`)
    } catch {
      toast.error('Failed to delete file')
    }
  }

  const handleDuplicateFile = async (name: string, files: FileList) => {
    if (!snippet) return
    const file = files.find(f => f.name === name)
    if (!file) return
    const ext = name.includes('.') ? `.${name.split('.').pop()}` : ''
    const base = name.replace(/\.[^.]+$/, '')
    const dupName = `${base}-copy${ext}`
    try {
      await dispatch(
        updateSnippet({
          ...snippet,
          files: [...files, { name: dupName, content: file.content }],
        }),
      ).unwrap()
      toast.success(`Duplicated as ${dupName}`)
      return dupName
    } catch {
      toast.error('Failed to duplicate file')
    }
  }

  return {
    renaming,
    setRenaming,
    renameValue,
    setRenameValue,
    addingFile,
    setAddingFile,
    newFileName,
    setNewFileName,
    newFileInputRef,
    handleNewFile,
    commitNewFile,
    handleStartRename,
    commitRename,
    handleDeleteFile,
    handleDuplicateFile,
  }
}
