/**
 * useFileUpload Hook
 * File upload state management with drag and drop support
 *
 * @example
 * const upload = useFileUpload(
 *   (files) => console.log('Files selected:', files),
 *   1024 * 1024, // 1MB max size
 *   false // not disabled
 * )
 *
 * <div
 *   className={upload.isDragging ? 'dragging' : ''}
 *   onDrop={upload.handleDrop}
 *   onDragOver={upload.handleDragOver}
 *   onDragLeave={upload.handleDragLeave}
 * >
 *   <input
 *     type="file"
 *     multiple
 *     onChange={(e) => upload.handleFiles(e.target.files)}
 *   />
 *   {upload.selectedFiles.map((file, i) => (
 *     <div key={i}>
 *       {file.name}
 *       <button onClick={() => upload.removeFile(i)}>Remove</button>
 *     </div>
 *   ))}
 * </div>
 */

import { useState } from 'react'

export interface UseFileUploadReturn {
  /** Whether files are being dragged over the drop zone */
  isDragging: boolean
  /** Currently selected files */
  selectedFiles: File[]
  /** Handle files from file input or drop */
  handleFiles: (files: FileList | null) => void
  /** Handle drop event */
  handleDrop: (e: React.DragEvent) => void
  /** Handle drag over event */
  handleDragOver: (e: React.DragEvent) => void
  /** Handle drag leave event */
  handleDragLeave: () => void
  /** Remove a file by index */
  removeFile: (index: number) => void
}

/**
 * Hook for managing file uploads with drag and drop
 * @param onFilesSelected - Callback when files are selected
 * @param maxSize - Maximum file size in bytes (optional)
 * @param disabled - Whether uploads are disabled
 * @returns Object containing upload state and handlers
 */
export function useFileUpload(
  onFilesSelected: (files: File[]) => void,
  maxSize?: number,
  disabled?: boolean
): UseFileUploadReturn {
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
