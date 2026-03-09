import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { saveFile, deleteFile, type FileItem } from '@/store/slices/filesSlice'
import { toast } from '@/components/ui/sonner'
import copy from '@/data/persistence-example.json'

export function usePersistenceExample() {
  const dispatch = useAppDispatch()
  const files = useAppSelector((state) => state.files.files)
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleSave = async () => {
    if (!fileName.trim()) {
      toast.error(copy.toasts.fileNameRequired)
      return
    }

    const fileItem: FileItem = {
      id: editingId || `file-${Date.now()}`,
      name: fileName,
      content: fileContent,
      language: 'javascript',
      path: `/src/${fileName}`,
      updatedAt: Date.now(),
    }

    try {
      await (dispatch as any)(saveFile(fileItem)).unwrap()
      toast.success(copy.toasts.saveSuccess.replace('{{name}}', fileName), {
        description: copy.toasts.saveDescription,
      })
      setFileName('')
      setFileContent('')
      setEditingId(null)
    } catch (error: unknown) {
      toast.error(copy.toasts.saveErrorTitle, {
        description: String(error),
      })
    }
  }

  const handleEdit = (file: FileItem) => {
    setEditingId(file.id)
    setFileName(file.name)
    setFileContent(file.content)
  }

  const handleDelete = async (fileId: string, name: string) => {
    try {
      await (dispatch as any)(deleteFile(fileId)).unwrap()
      toast.success(copy.toasts.deleteSuccess.replace('{{name}}', name), {
        description: copy.toasts.deleteDescription,
      })
    } catch (error: unknown) {
      toast.error(copy.toasts.deleteErrorTitle, {
        description: String(error),
      })
    }
  }

  const handleCancel = () => {
    setFileName('')
    setFileContent('')
    setEditingId(null)
  }

  const handleFileNameChange = (value: string) => {
    setFileName(value)
  }

  const handleFileContentChange = (value: string) => {
    setFileContent(value)
  }

  const editorTitle = editingId ? copy.editor.titleEdit : copy.editor.titleCreate
  const saveButtonText = editingId ? copy.editor.updateButton : copy.editor.saveButton
  const fileCount = `${files.length} ${copy.files.countLabel}`

  const formattedFiles = files.map((file) => ({
    ...file,
    contentPreview: file.content
      ? file.content.length > 100
        ? file.content.substring(0, 100) + '...'
        : file.content
      : null,
    updatedAtFormatted: new Date(file.updatedAt).toLocaleTimeString(),
  }))

  return {
    files,
    formattedFiles,
    fileName,
    fileContent,
    editingId,
    editorTitle,
    saveButtonText,
    fileCount,
    handlers: {
      handleSave,
      handleEdit,
      handleDelete,
      handleCancel,
      handleFileNameChange,
      handleFileContentChange,
    },
    copy,
  }
}
