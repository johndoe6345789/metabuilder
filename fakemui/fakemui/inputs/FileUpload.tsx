'use client'

import React, { forwardRef, useCallback, useRef, useState } from 'react'
import { FormLabel } from './FormLabel'
import { FormHelperText } from './FormHelperText'

export interface FileUploadProps {
  label?: React.ReactNode
  helperText?: React.ReactNode
  error?: boolean
  value?: File | File[]
  onChange?: (files: File[]) => void
  onRemove?: (file: File) => void
  disabled?: boolean
  required?: boolean
  className?: string
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  dragDrop?: boolean
  showPreview?: boolean
  variant?: 'default' | 'button' | 'dropzone'
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      label,
      helperText,
      error,
      value,
      onChange,
      onRemove,
      disabled,
      required,
      className = '',
      accept,
      multiple = false,
      maxSize,
      maxFiles,
      dragDrop = true,
      showPreview = true,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [files, setFiles] = useState<File[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const validateFiles = useCallback((fileList: File[]): File[] => {
      let validFiles = fileList

      if (maxSize) {
        validFiles = validFiles.filter((file) => {
          if (file.size > maxSize) {
            setErrorMessage(`File ${file.name} exceeds max size of ${maxSize / 1024 / 1024}MB`)
            return false
          }
          return true
        })
      }

      if (maxFiles && validFiles.length > maxFiles) {
        setErrorMessage(`Maximum ${maxFiles} files allowed`)
        validFiles = validFiles.slice(0, maxFiles)
      }

      return validFiles
    }, [maxSize, maxFiles])

    const handleFiles = useCallback((fileList: FileList | null) => {
      if (!fileList) return
      setErrorMessage(null)
      
      const newFiles = Array.from(fileList)
      const validFiles = validateFiles(newFiles)
      
      if (multiple) {
        const combined = [...files, ...validFiles]
        const limited = maxFiles ? combined.slice(0, maxFiles) : combined
        setFiles(limited)
        onChange?.(limited)
      } else {
        setFiles(validFiles.slice(0, 1))
        onChange?.(validFiles.slice(0, 1))
      }
    }, [files, multiple, maxFiles, onChange, validateFiles])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
    }, [handleFiles])

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled && dragDrop) {
        setIsDragging(true)
      }
    }, [disabled, dragDrop])

    const handleDragLeave = useCallback(() => {
      setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (!disabled && dragDrop) {
        handleFiles(e.dataTransfer.files)
      }
    }, [disabled, dragDrop, handleFiles])

    const handleRemove = useCallback((file: File) => {
      const newFiles = files.filter((f) => f !== file)
      setFiles(newFiles)
      onChange?.(newFiles)
      onRemove?.(file)
    }, [files, onChange, onRemove])

    const handleClick = useCallback(() => {
      inputRef.current?.click()
    }, [])

    const displayError = errorMessage || (error ? helperText : null)

    return (
      <div className={`file-upload file-upload--${variant} ${error || errorMessage ? 'file-upload--error' : ''} ${disabled ? 'file-upload--disabled' : ''} ${className}`}>
        {label && <FormLabel required={required}>{label}</FormLabel>}
        
        <div
          className={`file-upload__dropzone ${isDragging ? 'file-upload__dropzone--dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={(el) => {
              if (typeof ref === 'function') ref(el)
              else if (ref) ref.current = el
              ;(inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el
            }}
            type="file"
            onChange={handleChange}
            disabled={disabled}
            accept={accept}
            multiple={multiple}
            className="file-upload__input"
            {...props}
          />
          <div className="file-upload__content">
            <span className="file-upload__icon">📁</span>
            <span className="file-upload__text">
              {isDragging
                ? 'Drop files here'
                : dragDrop
                  ? 'Drag and drop or click to upload'
                  : 'Click to upload'}
            </span>
            {accept && <span className="file-upload__hint">Accepted: {accept}</span>}
          </div>
        </div>

        {showPreview && files.length > 0 && (
          <div className="file-upload__preview">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="file-upload__file">
                <span className="file-upload__filename">{file.name}</span>
                <span className="file-upload__size">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <button
                  type="button"
                  className="file-upload__remove"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(file)
                  }}
                  disabled={disabled}
                  aria-label={`Remove ${file.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {displayError && <FormHelperText error>{displayError}</FormHelperText>}
        {!displayError && helperText && <FormHelperText>{helperText}</FormHelperText>}
      </div>
    )
  }
)

FileUpload.displayName = 'FileUpload'
