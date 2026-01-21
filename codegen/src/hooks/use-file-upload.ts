import { useState } from 'react'

export function useFileUpload(
  onFilesSelected: (files: File[]) => void,
  maxSize?: number,
  disabled?: boolean
) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      if (maxSize && file.size > maxSize) {
        return false
      }
      return true
    })

    setSelectedFiles(validFiles)
    onFilesSelected(validFiles)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (!disabled) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFilesSelected(newFiles)
  }

  return {
    isDragging,
    selectedFiles,
    handleFiles,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    removeFile,
  }
}
