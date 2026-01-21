# Database Export/Import Implementation Specification

**Phase**: 3 - Admin Features
**Component**: Database Management Export/Import
**Status**: Implementation Specification (Ready for Development)
**Date**: 2026-01-21

## Overview

This specification provides complete TypeScript implementations for database export/import functionality, including hooks, handlers, utilities, and error management. All code follows the existing MetaBuilder patterns (one lambda per file, retry logic, standardized responses).

---

## 1. Type Definitions

### File: `/frontends/nextjs/src/lib/admin/export-import-types.ts`

```typescript
/**
 * Export/Import type definitions
 * Shared types for database export and import operations
 */

export type ExportFormat = 'json' | 'yaml' | 'sql'
export type ImportMode = 'append' | 'upsert' | 'replace'
export type FileFormat = 'json' | 'yaml' | 'sql' | 'unknown'

// ============ EXPORT TYPES ============

export interface ExportOptions {
  format: ExportFormat
  entityTypes?: string[] // Empty array = all entities
  includeSchema?: boolean
  includeMetadata?: boolean
  prettyPrint?: boolean
}

export interface ExportProgress {
  current: number
  total: number
  currentEntity?: string
  estimatedTimeRemaining?: number
}

export interface ExportResult {
  success: boolean
  downloadUrl?: string
  filename?: string
  size?: number
  recordCount?: number
  entitiesExported?: string[]
  error?: string
  timestamp: string
}

// ============ IMPORT TYPES ============

export interface ImportOptions {
  mode: ImportMode
  dryRun?: boolean
  validateOnly?: boolean
  stopOnError?: boolean
  chunkSize?: number // Records per batch
}

export interface ImportRecord {
  rowNumber?: number
  entity: string
  action: 'created' | 'updated' | 'skipped' | 'error'
  status: 'success' | 'warning' | 'error'
  message?: string
  details?: unknown
}

export interface ImportError {
  rowNumber?: number
  entityType: string
  errorCode: string
  errorMessage: string
  suggestedFix?: string
  affectedRecord?: unknown
}

export interface ImportResults {
  dryRun: boolean
  totalRecords: number
  successCount: number
  skippedCount: number
  errorCount: number
  warningCount: number
  errors: ImportError[]
  warnings: Array<{ message: string; rowNumber?: number }>
  startTime: string
  endTime: string
  duration: number // milliseconds
  importedEntities: string[]
  timestamp: string
}

// ============ FILE HANDLING TYPES ============

export interface FileValidationResult {
  valid: boolean
  format: FileFormat
  size: number
  error?: string
  reason?: string
}

export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
  format: FileFormat
}

// ============ PROGRESS TRACKING ============

export interface ExportProgressEvent {
  type: 'start' | 'progress' | 'complete' | 'error'
  progress?: ExportProgress
  error?: string
  result?: ExportResult
}

export interface ImportProgressEvent {
  type: 'start' | 'progress' | 'chunk_complete' | 'complete' | 'error'
  progress?: {
    current: number
    total: number
    currentEntity?: string
  }
  chunkResults?: ImportRecord[]
  error?: string
  result?: ImportResults
}

// ============ HOOK RETURN TYPES ============

export interface UseExportReturn {
  // State
  selectedFormat: ExportFormat
  selectedEntities: string[]
  isExporting: boolean
  error: string | null
  progress: ExportProgress | null

  // Handlers
  setFormat: (format: ExportFormat) => void
  setEntities: (entities: string[]) => void
  exportDatabase: () => Promise<void>
  cancelExport: () => void
  clearError: () => void
}

export interface UseImportReturn {
  // State
  selectedFile: File | null
  importMode: ImportMode
  isDryRun: boolean
  isImporting: boolean
  importResults: ImportResults | null
  error: string | null
  progress: { current: number; total: number } | null

  // Handlers
  setFile: (file: File | null) => void
  setMode: (mode: ImportMode) => void
  setDryRun: (enabled: boolean) => void
  importDatabase: () => Promise<void>
  cancelImport: () => void
  clearResults: () => void
  clearError: () => void
}

// ============ API RESPONSE TYPES ============

export interface ExportApiResponse {
  success: boolean
  data?: {
    url?: string
    filename: string
    size: number
    recordCount: number
    entitiesExported: string[]
  }
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

export interface ImportApiResponse {
  success: boolean
  data?: ImportResults
  error?: {
    code: string
    message: string
    details?: unknown
  }
}
```

---

## 2. Utilities

### File: `/frontends/nextjs/src/lib/admin/import-export-utils.ts`

```typescript
/**
 * Import/Export utility functions
 * File handling, format detection, validation
 */

import type { FileFormat, FileValidationResult } from './export-import-types'

const SUPPORTED_FORMATS = ['json', 'yaml', 'yml', 'sql']
const MAX_FILE_SIZE_MB = 100
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

// ============ FORMAT DETECTION ============

/**
 * Detect file format from file extension or MIME type
 */
export function detectFormat(file: File): FileFormat {
  const name = file.name.toLowerCase()
  const mimeType = file.type.toLowerCase()

  // Check extension first
  if (name.endsWith('.json') || mimeType.includes('json')) {
    return 'json'
  }
  if (name.endsWith('.yaml') || name.endsWith('.yml') || mimeType.includes('yaml')) {
    return 'yaml'
  }
  if (name.endsWith('.sql') || mimeType.includes('sql')) {
    return 'sql'
  }

  return 'unknown'
}

/**
 * Get file extension for format
 */
export function getFileExtension(format: FileFormat): string {
  const map: Record<FileFormat, string> = {
    json: 'json',
    yaml: 'yaml',
    sql: 'sql',
    unknown: 'bin',
  }
  return map[format]
}

/**
 * Get MIME type for format
 */
export function getMimeType(format: FileFormat): string {
  const map: Record<FileFormat, string> = {
    json: 'application/json',
    yaml: 'application/x-yaml',
    sql: 'application/sql',
    unknown: 'application/octet-stream',
  }
  return map[format]
}

// ============ FILE VALIDATION ============

/**
 * Validate file before import
 * Checks: size, format, basic structure
 */
export function validateFile(file: File): FileValidationResult {
  // Check size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      format: 'unknown',
      size: file.size,
      error: 'FILE_TOO_LARGE',
      reason: `File exceeds ${MAX_FILE_SIZE_MB}MB limit (${formatFileSize(file.size)})`,
    }
  }

  // Check format
  const format = detectFormat(file)
  if (format === 'unknown') {
    return {
      valid: false,
      format: 'unknown',
      size: file.size,
      error: 'UNSUPPORTED_FORMAT',
      reason: 'File format not recognized. Expected JSON, YAML, or SQL.',
    }
  }

  return {
    valid: true,
    format,
    size: file.size,
  }
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxMB: number = MAX_FILE_SIZE_MB): boolean {
  return size <= maxMB * 1024 * 1024
}

/**
 * Format file size for display (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = (bytes / Math.pow(k, i)).toFixed(2)

  return `${value} ${sizes[i]}`
}

// ============ TIMESTAMP FORMATTING ============

/**
 * Format timestamp for export filename
 * Example: "2026-01-21T15-30-45Z"
 */
export function formatExportTimestamp(date: Date = new Date()): string {
  const iso = date.toISOString()
  // Convert "2026-01-21T15:30:45.123Z" to "2026-01-21T15-30-45Z"
  return iso.replace(/[:.]/g, (match) => {
    if (match === '.') return '' // Remove milliseconds
    return '-'
  }).replace('Z', 'Z')
}

/**
 * Generate export filename
 * Pattern: "metabuilder-export-{timestamp}-{format}.{ext}"
 */
export function generateExportFilename(format: FileFormat, timestamp?: Date): string {
  const ts = formatExportTimestamp(timestamp)
  const ext = getFileExtension(format)
  return `metabuilder-export-${ts}-${format}.${ext}`
}

// ============ FILE READING ============

/**
 * Read file as text
 * Returns a promise that resolves with file contents as string
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result
      if (typeof content === 'string') {
        resolve(content)
      } else {
        reject(new Error('Failed to read file as text'))
      }
    }
    reader.onerror = () => reject(new Error('File read error'))
    reader.readAsText(file)
  })
}

/**
 * Read file as ArrayBuffer (for binary data)
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result
      if (content instanceof ArrayBuffer) {
        resolve(content)
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'))
      }
    }
    reader.onerror = () => reject(new Error('File read error'))
    reader.readAsArrayBuffer(file)
  })
}

// ============ DOWNLOAD HANDLING ============

/**
 * Trigger file download from blob
 * Works with any blob type (JSON, YAML, SQL, etc.)
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Trigger file download from text content
 */
export function downloadText(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType })
  downloadBlob(blob, filename)
}

/**
 * Trigger file download from JSON data
 */
export function downloadJSON(data: unknown, filename: string): void {
  const content = JSON.stringify(data, null, 2)
  downloadText(content, filename, 'application/json')
}

// ============ RESULTS FORMATTING ============

/**
 * Format import results as human-readable string
 */
export function formatImportResults(results: {
  successCount: number
  skippedCount: number
  errorCount: number
  warningCount?: number
  duration: number
}): string {
  const lines = [
    `Import Results:`,
    `├─ Imported: ${results.successCount}`,
    `├─ Skipped: ${results.skippedCount}`,
    `├─ Errors: ${results.errorCount}`,
  ]

  if ((results.warningCount ?? 0) > 0) {
    lines.push(`├─ Warnings: ${results.warningCount}`)
  }

  lines.push(`└─ Duration: ${formatDuration(results.duration)}`)

  return lines.join('\n')
}

/**
 * Format duration in milliseconds to readable string
 * Example: "1s", "2m 30s", "1h 2m"
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

/**
 * Generate error report as CSV format
 */
export function generateErrorReport(errors: Array<{
  rowNumber?: number
  entityType: string
  errorCode: string
  errorMessage: string
  suggestedFix?: string
}>): string {
  const headers = ['Row', 'Entity Type', 'Error Code', 'Error Message', 'Suggested Fix']
  const rows = errors.map((error) => [
    error.rowNumber?.toString() ?? 'N/A',
    error.entityType,
    error.errorCode,
    error.errorMessage,
    error.suggestedFix ?? 'N/A',
  ])

  // Simple CSV formatting (escape quotes and handle commas)
  const formatCell = (cell: string): string => {
    if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
      return `"${cell.replace(/"/g, '""')}"`
    }
    return cell
  }

  const csvLines = [
    headers.map(formatCell).join(','),
    ...rows.map((row) => row.map(formatCell).join(',')),
  ]

  return csvLines.join('\n')
}

/**
 * Generate error report filename
 * Pattern: "metabuilder-errors-{timestamp}.csv"
 */
export function generateErrorReportFilename(timestamp?: Date): string {
  const ts = formatExportTimestamp(timestamp)
  return `metabuilder-errors-${ts}.csv`
}

// ============ ENTITY FORMATTING ============

/**
 * Format entity type for display
 * Example: "page_config" → "Page Configuration"
 */
export function formatEntityName(entity: string): string {
  return entity
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Get default entity types to display
 */
export function getDefaultEntityTypes(): string[] {
  return [
    'users',
    'credentials',
    'page_configs',
    'workflows',
    'components',
    'packages',
    'sessions',
    'roles',
  ]
}
```

---

## 3. Export Hook

### File: `/frontends/nextjs/src/hooks/useDatabaseExport.ts`

```typescript
/**
 * useExport hook - Database export state management
 * Handles export format selection, entity selection, and export progress
 */

import { useState, useCallback } from 'react'
import type { ExportFormat, ExportProgress, UseExportReturn } from '@/lib/admin/export-import-types'
import { retry } from '@/lib/api/retry'
import { generateExportFilename } from '@/lib/admin/import-export-utils'

export function useDatabaseExport(): UseExportReturn {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json')
  const [selectedEntities, setSelectedEntities] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const handleSetFormat = useCallback((format: ExportFormat) => {
    setSelectedFormat(format)
    setError(null)
  }, [])

  const handleSetEntities = useCallback((entities: string[]) => {
    setSelectedEntities(entities)
    setError(null)
  }, [])

  const handleExportDatabase = useCallback(async () => {
    if (isExporting) return

    setIsExporting(true)
    setError(null)
    setProgress(null)

    const controller = new AbortController()
    setAbortController(controller)

    try {
      // Build query parameters
      const params = new URLSearchParams()
      params.set('format', selectedFormat)

      if (selectedEntities.length > 0) {
        params.set('entities', selectedEntities.join(','))
      }

      // Make export request with retry logic
      const response = await retry(
        async () => {
          return fetch(`/api/admin/database/export?${params.toString()}`, {
            method: 'GET',
            signal: controller.signal,
          })
        },
        {
          maxRetries: 3,
          initialDelayMs: 1000,
          maxDelayMs: 5000,
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.error?.message || `Export failed with status ${response.status}`)
      }

      // Get the blob from response
      const blob = await response.blob()

      // Generate filename and trigger download
      const filename = generateExportFilename(selectedFormat)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Success state
      setProgress({
        current: 100,
        total: 100,
        estimatedTimeRemaining: 0,
      })
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Export cancelled')
        } else {
          setError(err.message)
        }
      } else {
        setError('An unexpected error occurred during export')
      }
    } finally {
      setIsExporting(false)
      setAbortController(null)
    }
  }, [selectedFormat, selectedEntities, isExporting])

  const handleCancelExport = useCallback(() => {
    if (abortController) {
      abortController.abort()
      setIsExporting(false)
      setError('Export cancelled by user')
    }
  }, [abortController])

  const handleClearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    selectedFormat,
    selectedEntities,
    isExporting,
    error,
    progress,
    setFormat: handleSetFormat,
    setEntities: handleSetEntities,
    exportDatabase: handleExportDatabase,
    cancelExport: handleCancelExport,
    clearError: handleClearError,
  }
}
```

---

## 4. Export Handler

### File: `/frontends/nextjs/src/lib/admin/export-handler.ts`

```typescript
/**
 * Export handler - Core export logic
 * Handles API calls, file streaming, and download triggers
 */

import type { ExportFormat, ExportOptions } from './export-import-types'
import { retryFetch } from '@/lib/api/retry'
import { generateExportFilename, downloadBlob } from './import-export-utils'

export interface ExportHandlerOptions extends ExportOptions {
  onProgress?: (progress: { current: number; total: number; currentEntity?: string }) => void
  onComplete?: (filename: string, size: number) => void
  onError?: (error: Error) => void
  signal?: AbortSignal
}

/**
 * Handle database export
 * Builds request, handles response streaming, triggers download
 */
export async function handleExport(
  format: ExportFormat,
  entityTypes: string[] = [],
  options: Partial<ExportHandlerOptions> = {}
): Promise<{ filename: string; size: number }> {
  const {
    onProgress,
    onComplete,
    onError,
    signal,
    includeSchema = true,
    includeMetadata = true,
    prettyPrint = true,
  } = options

  try {
    // Build query parameters
    const params = new URLSearchParams()
    params.set('format', format)
    params.set('includeSchema', String(includeSchema))
    params.set('includeMetadata', String(includeMetadata))
    params.set('prettyPrint', String(prettyPrint))

    if (entityTypes.length > 0) {
      params.set('entities', entityTypes.join(','))
    }

    // Fetch with retry
    const response = await retryFetch(
      () => fetch(`/api/admin/database/export?${params.toString()}`, {
        method: 'GET',
        signal,
      }),
      {
        maxRetries: 3,
        initialDelayMs: 1000,
        maxDelayMs: 5000,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData?.error?.message || `Export failed with status ${response.status}`
      throw new Error(message)
    }

    // Get content length for progress tracking
    const contentLength = response.headers.get('content-length')
    const totalSize = contentLength ? parseInt(contentLength, 10) : 0

    // Read response body
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body not available')
    }

    const chunks: Uint8Array[] = []
    let receivedSize = 0

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        chunks.push(value)
        receivedSize += value.length

        if (onProgress && totalSize > 0) {
          onProgress({
            current: receivedSize,
            total: totalSize,
            currentEntity: undefined,
          })
        }
      }
    } finally {
      reader.releaseLock()
    }

    // Combine chunks into single blob
    const blob = new Blob(chunks, { type: response.headers.get('content-type') || 'application/octet-stream' })

    // Generate filename and trigger download
    const filename = generateExportFilename(format)
    downloadBlob(blob, filename)

    if (onComplete) {
      onComplete(filename, blob.size)
    }

    return { filename, size: blob.size }
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown export error')
    if (onError) {
      onError(err)
    }
    throw err
  }
}

/**
 * Get preview of what would be exported
 * Returns entity counts without actually exporting
 */
export async function getExportPreview(
  entityTypes?: string[]
): Promise<{ entity: string; count: number }[]> {
  const params = new URLSearchParams()
  params.set('preview', 'true')

  if (entityTypes && entityTypes.length > 0) {
    params.set('entities', entityTypes.join(','))
  }

  const response = await fetch(`/api/admin/database/export?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Failed to get export preview: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data?.preview ?? []
}

/**
 * Check if export operation is in progress
 * Useful for preventing multiple concurrent exports
 */
export async function isExportInProgress(): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/database/export?status=check')
    if (!response.ok) return false

    const data = await response.json()
    return data.data?.inProgress ?? false
  } catch {
    return false
  }
}
```

---

## 5. Import Hook

### File: `/frontends/nextjs/src/hooks/useDatabaseImport.ts`

```typescript
/**
 * useImport hook - Database import state management
 * Handles file selection, import mode, dry-run, and progress tracking
 */

import { useState, useCallback } from 'react'
import type {
  ImportMode,
  ImportResults,
  UseImportReturn,
} from '@/lib/admin/export-import-types'
import { validateFile } from '@/lib/admin/import-export-utils'
import { retry } from '@/lib/api/retry'

export function useDatabaseImport(): UseImportReturn {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<ImportMode>('append')
  const [isDryRun, setIsDryRun] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
  const [importResults, setImportResults] = useState<ImportResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const handleSetFile = useCallback((file: File | null) => {
    if (file) {
      const validation = validateFile(file)
      if (!validation.valid) {
        setError(validation.reason ?? 'Invalid file')
        return
      }
    }
    setSelectedFile(file)
    setError(null)
    setImportResults(null)
  }, [])

  const handleSetMode = useCallback((mode: ImportMode) => {
    setImportMode(mode)
    setError(null)
  }, [])

  const handleSetDryRun = useCallback((enabled: boolean) => {
    setIsDryRun(enabled)
    setError(null)
  }, [])

  const handleImportDatabase = useCallback(async () => {
    if (isImporting || !selectedFile) return

    setIsImporting(true)
    setError(null)
    setProgress(null)

    const controller = new AbortController()
    setAbortController(controller)

    try {
      // Create FormData with file
      const formData = new FormData()
      formData.set('file', selectedFile)
      formData.set('mode', importMode)
      formData.set('dryRun', String(isDryRun))

      // Make import request with retry
      const response = await retry(
        async () => {
          return fetch('/api/admin/database/import', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          })
        },
        {
          maxRetries: 3,
          initialDelayMs: 1000,
          maxDelayMs: 5000,
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.error?.message || `Import failed with status ${response.status}`)
      }

      const result = await response.json()
      const results = result.data as ImportResults

      setImportResults(results)
      setProgress({
        current: results.totalRecords,
        total: results.totalRecords,
      })
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Import cancelled')
        } else {
          setError(err.message)
        }
      } else {
        setError('An unexpected error occurred during import')
      }
    } finally {
      setIsImporting(false)
      setAbortController(null)
    }
  }, [selectedFile, importMode, isDryRun, isImporting])

  const handleCancelImport = useCallback(() => {
    if (abortController) {
      abortController.abort()
      setIsImporting(false)
      setError('Import cancelled by user')
    }
  }, [abortController])

  const handleClearResults = useCallback(() => {
    setImportResults(null)
    setProgress(null)
  }, [])

  const handleClearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    selectedFile,
    importMode,
    isDryRun,
    isImporting,
    importResults,
    error,
    progress,
    setFile: handleSetFile,
    setMode: handleSetMode,
    setDryRun: handleSetDryRun,
    importDatabase: handleImportDatabase,
    cancelImport: handleCancelImport,
    clearResults: handleClearResults,
    clearError: handleClearError,
  }
}
```

---

## 6. Import Handler

### File: `/frontends/nextjs/src/lib/admin/import-handler.ts`

```typescript
/**
 * Import handler - Core import logic
 * Handles file validation, chunking, API calls, and results processing
 */

import type { ImportMode, ImportResults } from './export-import-types'
import { retryFetch } from '@/lib/api/retry'
import { validateFile, readFileAsText } from './import-export-utils'

export interface ImportHandlerOptions {
  mode: ImportMode
  dryRun?: boolean
  chunkSize?: number
  onProgress?: (progress: { current: number; total: number; currentChunk?: number }) => void
  onChunkComplete?: (results: { successCount: number; errorCount: number }) => void
  onComplete?: (results: ImportResults) => void
  onError?: (error: Error) => void
  signal?: AbortSignal
}

/**
 * Handle database import
 * Validates file, sends to API, processes results
 */
export async function handleImport(
  file: File,
  options: Partial<ImportHandlerOptions> = {}
): Promise<ImportResults> {
  const {
    mode = 'append',
    dryRun = true,
    chunkSize = 1000,
    onProgress,
    onChunkComplete,
    onComplete,
    onError,
    signal,
  } = options

  try {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      throw new Error(`File validation failed: ${validation.reason}`)
    }

    // Read file content
    const content = await readFileAsText(file)

    // Parse file to estimate record count
    const recordCount = estimateRecordCount(content, validation.format)
    if (onProgress) {
      onProgress({ current: 0, total: recordCount })
    }

    // Create FormData for multipart upload
    const formData = new FormData()
    formData.set('file', file)
    formData.set('mode', mode)
    formData.set('dryRun', String(dryRun))
    formData.set('chunkSize', String(chunkSize))

    // Send import request
    const response = await retryFetch(
      () => fetch('/api/admin/database/import', {
        method: 'POST',
        body: formData,
        signal,
      }),
      {
        maxRetries: 3,
        initialDelayMs: 1000,
        maxDelayMs: 5000,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const message = errorData?.error?.message || `Import failed with status ${response.status}`
      throw new Error(message)
    }

    const result = await response.json()
    const results: ImportResults = result.data

    // Final progress update
    if (onProgress) {
      onProgress({ current: results.totalRecords, total: results.totalRecords })
    }

    if (onComplete) {
      onComplete(results)
    }

    return results
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown import error')
    if (onError) {
      onError(err)
    }
    throw err
  }
}

/**
 * Estimate record count from file content
 * Used for progress bar initialization
 */
function estimateRecordCount(content: string, format: string): number {
  if (format === 'json') {
    // Count opening braces for objects or array elements
    const arrayMatch = content.match(/^\s*\[/)
    if (arrayMatch) {
      return (content.match(/{/g) || []).length
    }
    return (content.match(/^\s*{/) ? 1 : 0)
  }

  if (format === 'yaml') {
    // Count lines starting with '-' (array items)
    return (content.match(/^-\s/gm) || []).length || 1
  }

  if (format === 'sql') {
    // Count INSERT statements
    return (content.match(/INSERT\s+INTO/gi) || []).length || 1
  }

  return 1
}

/**
 * Validate import results for data quality
 * Returns warnings and errors found in results
 */
export function validateImportResults(results: ImportResults): {
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []

  if (results.errorCount > 0) {
    errors.push(`${results.errorCount} records failed to import`)

    // Categorize common errors
    const errorCodes = new Map<string, number>()
    for (const error of results.errors) {
      const count = errorCodes.get(error.errorCode) ?? 0
      errorCodes.set(error.errorCode, count + 1)
    }

    for (const [code, count] of errorCodes) {
      errors.push(`  - ${code}: ${count} occurrence(s)`)
    }
  }

  if (results.warningCount && results.warningCount > 0) {
    warnings.push(`${results.warningCount} warnings during import`)
  }

  if (results.skippedCount > 0) {
    warnings.push(`${results.skippedCount} records skipped`)
  }

  return { warnings, errors }
}

/**
 * Transform import results to summary format
 */
export function summarizeImportResults(results: ImportResults): {
  summary: string
  severity: 'success' | 'warning' | 'error'
  stats: { label: string; value: number; color: string }[]
} {
  const stats = [
    { label: 'Imported', value: results.successCount, color: 'success' },
    { label: 'Skipped', value: results.skippedCount, color: 'warning' },
    { label: 'Errors', value: results.errorCount, color: 'error' },
  ]

  let severity: 'success' | 'warning' | 'error' = 'success'
  if (results.errorCount > 0) severity = 'error'
  else if (results.warningCount || results.skippedCount > 0) severity = 'warning'

  const summary = `Imported ${results.successCount}, skipped ${results.skippedCount}, errors ${results.errorCount}`

  return { summary, severity, stats }
}

/**
 * Check import compatibility before importing
 * Returns potential issues that may occur during import
 */
export async function checkImportCompatibility(
  file: File,
  mode: ImportMode
): Promise<{ compatible: boolean; issues: string[] }> {
  const issues: string[] = []

  // Validate file
  const validation = validateFile(file)
  if (!validation.valid) {
    issues.push(`Invalid file: ${validation.reason}`)
    return { compatible: false, issues }
  }

  // Check for potential conflicts in replace mode
  if (mode === 'replace') {
    issues.push('Replace mode will delete all existing data. This cannot be undone.')
  }

  // Check file structure
  try {
    const content = await readFileAsText(file)
    if (validation.format === 'json') {
      JSON.parse(content)
    }
    // Add YAML/SQL parsing if needed
  } catch (error) {
    issues.push(`File parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return { compatible: issues.length === 0, issues }
}
```

---

## 7. Import Results Hook

### File: `/frontends/nextjs/src/hooks/useImportResults.ts`

```typescript
/**
 * useImportResults hook - Import results display state
 * Manages results modal visibility and error report generation
 */

import { useState, useCallback } from 'react'
import type { ImportResults } from '@/lib/admin/export-import-types'
import {
  generateErrorReport,
  generateErrorReportFilename,
  downloadText,
} from '@/lib/admin/import-export-utils'

export interface UseImportResultsReturn {
  results: ImportResults | null
  isShowing: boolean
  showResults: (results: ImportResults) => void
  dismissResults: () => void
  downloadErrorReport: () => void
}

export function useImportResults(): UseImportResultsReturn {
  const [results, setResults] = useState<ImportResults | null>(null)
  const [isShowing, setIsShowing] = useState(false)

  const showResults = useCallback((importResults: ImportResults) => {
    setResults(importResults)
    setIsShowing(true)
  }, [])

  const dismissResults = useCallback(() => {
    setIsShowing(false)
    // Keep results in state for reference, but hide modal
  }, [])

  const downloadErrorReport = useCallback(() => {
    if (!results || results.errors.length === 0) {
      return
    }

    const csv = generateErrorReport(results.errors)
    const filename = generateErrorReportFilename()
    downloadText(csv, filename, 'text/csv')
  }, [results])

  return {
    results,
    isShowing,
    showResults,
    dismissResults,
    downloadErrorReport,
  }
}
```

---

## 8. File Upload Handler

### File: `/frontends/nextjs/src/lib/admin/file-upload-handler.ts`

```typescript
/**
 * File upload handler - Drag-and-drop and file selection
 * Handles file validation, display, and error reporting
 */

import type { FileInfo, FileValidationResult } from './export-import-types'
import { validateFile, detectFormat, formatFileSize } from './import-export-utils'

export interface FileUploadHandlerOptions {
  onFileSelect: (file: File) => void
  onFileError: (error: string) => void
  onDragEnter?: () => void
  onDragLeave?: () => void
  acceptedFormats?: string[]
  maxFileSizeMB?: number
}

/**
 * Create file upload handler for drag-and-drop and click-to-browse
 */
export function createFileUploadHandler(options: FileUploadHandlerOptions) {
  const {
    onFileSelect,
    onFileError,
    onDragEnter,
    onDragLeave,
    maxFileSizeMB = 100,
  } = options

  const handleFile = (file: File) => {
    const validation = validateFile(file)

    if (!validation.valid) {
      onFileError(validation.reason ?? 'Invalid file')
      return
    }

    onFileSelect(file)
  }

  const handleFilesFromEvent = (files: FileList | null) => {
    if (!files || files.length === 0) {
      onFileError('No file selected')
      return
    }

    if (files.length > 1) {
      onFileError('Only one file can be imported at a time')
      return
    }

    handleFile(files[0])
  }

  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onDragEnter?.()
  }

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onDragLeave?.()
  }

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onDragLeave?.()

    const files = e.dataTransfer.files
    handleFilesFromEvent(files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    handleFilesFromEvent(files)
  }

  return {
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleInputChange,
    handleFile,
  }
}

/**
 * Get file info for display
 */
export function getFileInfo(file: File): FileInfo {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    format: detectFormat(file),
  }
}

/**
 * Format file info as display string
 */
export function formatFileInfo(file: File): string {
  const size = formatFileSize(file.size)
  const date = new Date(file.lastModified).toLocaleDateString()
  return `${file.name} (${size}, modified ${date})`
}
```

---

## 9. Error Handling Utilities

### File: `/frontends/nextjs/src/lib/admin/export-import-errors.ts`

```typescript
/**
 * Error handling and standardization
 * Maps API errors to user-friendly messages
 */

export interface ErrorContext {
  code: string
  message: string
  details?: unknown
  userMessage?: string
  suggestedAction?: string
}

// Export error mapping
export const EXPORT_ERRORS = {
  PERMISSION_DENIED: {
    userMessage: "You don't have permission to export the database",
    suggestedAction: 'Contact your administrator if you need export access',
  },
  FILE_TOO_LARGE: {
    userMessage: 'Export file is too large',
    suggestedAction: 'Try exporting fewer entity types',
  },
  INVALID_FORMAT: {
    userMessage: 'Invalid export format selected',
    suggestedAction: 'Choose JSON, YAML, or SQL',
  },
  DATABASE_ERROR: {
    userMessage: 'Database error during export',
    suggestedAction: 'Try again later, or contact support if the problem persists',
  },
  NETWORK_ERROR: {
    userMessage: 'Network error during export',
    suggestedAction: 'Check your internet connection and try again',
  },
  TIMEOUT: {
    userMessage: 'Export took too long',
    suggestedAction: 'Try exporting fewer entities, or try again later',
  },
}

// Import error mapping
export const IMPORT_ERRORS = {
  PERMISSION_DENIED: {
    userMessage: "You don't have permission to import data",
    suggestedAction: 'Contact your administrator if you need import access',
  },
  FILE_TOO_LARGE: {
    userMessage: 'File exceeds the maximum size limit (100MB)',
    suggestedAction: 'Split the file into smaller parts and import separately',
  },
  UNSUPPORTED_FORMAT: {
    userMessage: 'File format not recognized',
    suggestedAction: 'Make sure the file is JSON, YAML, or SQL format',
  },
  INVALID_FILE_STRUCTURE: {
    userMessage: 'File structure is invalid',
    suggestedAction: 'Check that the file is properly formatted',
  },
  VALIDATION_ERROR: {
    userMessage: 'Data validation failed',
    suggestedAction: 'Review the error report and fix the data',
  },
  DUPLICATE_RECORDS: {
    userMessage: 'Some records already exist',
    suggestedAction: 'Choose "upsert" mode to update existing records or "replace" to overwrite',
  },
  FOREIGN_KEY_VIOLATION: {
    userMessage: 'Foreign key constraints violated',
    suggestedAction: 'Make sure all related records are included in the import',
  },
  DATABASE_ERROR: {
    userMessage: 'Database error during import',
    suggestedAction: 'Try again later, or contact support if the problem persists',
  },
  NETWORK_ERROR: {
    userMessage: 'Network error during import',
    suggestedAction: 'Check your internet connection and try again',
  },
  TIMEOUT: {
    userMessage: 'Import took too long',
    suggestedAction: 'Try importing fewer records at once',
  },
}

/**
 * Get user-friendly error message for API error code
 */
export function getExportErrorMessage(errorCode: string): ErrorContext {
  const mapping = EXPORT_ERRORS[errorCode as keyof typeof EXPORT_ERRORS]
  if (mapping) {
    return {
      code: errorCode,
      message: mapping.userMessage,
      suggestedAction: mapping.suggestedAction,
    }
  }

  return {
    code: errorCode,
    message: 'An unexpected error occurred during export',
    suggestedAction: 'Try again later, or contact support',
  }
}

/**
 * Get user-friendly error message for import error code
 */
export function getImportErrorMessage(errorCode: string): ErrorContext {
  const mapping = IMPORT_ERRORS[errorCode as keyof typeof IMPORT_ERRORS]
  if (mapping) {
    return {
      code: errorCode,
      message: mapping.userMessage,
      suggestedAction: mapping.suggestedAction,
    }
  }

  return {
    code: errorCode,
    message: 'An unexpected error occurred during import',
    suggestedAction: 'Try again later, or contact support',
  }
}

/**
 * Parse API error response and extract error context
 */
export function parseApiError(response: unknown): ErrorContext {
  const data = response as Record<string, unknown>

  if (data?.error && typeof data.error === 'object') {
    const error = data.error as Record<string, unknown>
    return {
      code: (error.code as string) || 'UNKNOWN_ERROR',
      message: (error.message as string) || 'An error occurred',
      details: error.details,
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
  }
}

/**
 * Create detailed error message with context
 */
export function formatErrorMessage(context: ErrorContext): string {
  const lines = [context.message]

  if (context.details) {
    const details = typeof context.details === 'string' ? context.details : JSON.stringify(context.details, null, 2)
    lines.push('')
    lines.push('Details:')
    lines.push(details)
  }

  if (context.suggestedAction) {
    lines.push('')
    lines.push(`Suggested action: ${context.suggestedAction}`)
  }

  return lines.join('\n')
}
```

---

## 10. Integration Examples

### Example: Export Tab Component

```typescript
/**
 * Example usage in database export tab
 */

import { useDatabaseExport } from '@/hooks/useDatabaseExport'
import { getDefaultEntityTypes, formatEntityName } from '@/lib/admin/import-export-utils'
import { getExportErrorMessage, formatErrorMessage } from '@/lib/admin/export-import-errors'

export function DatabaseExportTab() {
  const {
    selectedFormat,
    selectedEntities,
    isExporting,
    error,
    progress,
    setFormat,
    setEntities,
    exportDatabase,
    cancelExport,
    clearError,
  } = useDatabaseExport()

  const entityTypes = getDefaultEntityTypes()

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div>
        <label className="block text-sm font-medium mb-3">Export Format</label>
        <div className="flex gap-2">
          {(['json', 'yaml', 'sql'] as const).map((format) => (
            <button
              key={format}
              onClick={() => setFormat(format)}
              className={`px-4 py-2 rounded ${
                selectedFormat === format
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Entity Selection */}
      <div>
        <label className="block text-sm font-medium mb-3">Entities to Export</label>
        <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
          {entityTypes.map((entity) => (
            <label key={entity} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedEntities.includes(entity)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setEntities([...selectedEntities, entity])
                  } else {
                    setEntities(selectedEntities.filter((e) => e !== entity))
                  }
                }}
              />
              <span>{formatEntityName(entity)}</span>
            </label>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {selectedEntities.length === 0
            ? 'All entities will be exported'
            : `${selectedEntities.length} entities selected`}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={clearError}
            className="text-red-600 text-xs mt-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Progress */}
      {isExporting && progress && (
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Exporting...</span>
            <span>{progress.current}/{progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded h-2">
            <div
              className="bg-blue-500 h-2 rounded transition-all"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={exportDatabase}
          disabled={isExporting}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isExporting ? 'Exporting...' : 'Export Database'}
        </button>
        {isExporting && (
          <button
            onClick={cancelExport}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
```

### Example: Import Tab Component

```typescript
/**
 * Example usage in database import tab
 */

import { useDatabaseImport } from '@/hooks/useDatabaseImport'
import { useImportResults } from '@/hooks/useImportResults'
import { createFileUploadHandler, formatFileInfo } from '@/lib/admin/file-upload-handler'
import { getImportErrorMessage, formatErrorMessage } from '@/lib/admin/export-import-errors'

export function DatabaseImportTab() {
  const {
    selectedFile,
    importMode,
    isDryRun,
    isImporting,
    importResults,
    error,
    progress,
    setFile,
    setMode,
    setDryRun,
    importDatabase,
    cancelImport,
    clearResults,
    clearError,
  } = useDatabaseImport()

  const { downloadErrorReport } = useImportResults()
  const [isDragging, setIsDragging] = React.useState(false)

  const uploadHandler = createFileUploadHandler({
    onFileSelect: setFile,
    onFileError: (err) => {
      // Show error in UI (you might want to add this to hook state)
      clearError()
    },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  })

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        onDragEnter={uploadHandler.handleDragEnter}
        onDragLeave={uploadHandler.handleDragLeave}
        onDragOver={uploadHandler.handleDragOver}
        onDrop={uploadHandler.handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input
          type="file"
          id="file-input"
          onChange={uploadHandler.handleInputChange}
          accept=".json,.yaml,.yml,.sql"
          className="hidden"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <div className="text-4xl mb-2">📁</div>
          <p className="font-medium mb-1">Drag files here or click to browse</p>
          <p className="text-sm text-gray-600">Supported: JSON, YAML, SQL (max 100MB)</p>
        </label>
      </div>

      {/* File Info */}
      {selectedFile && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm text-blue-800">{formatFileInfo(selectedFile)}</p>
          <button
            onClick={() => setFile(null)}
            className="text-blue-600 text-xs mt-2 hover:underline"
          >
            Remove file
          </button>
        </div>
      )}

      {/* Import Mode */}
      <div>
        <label className="block text-sm font-medium mb-3">Import Mode</label>
        <select
          value={importMode}
          onChange={(e) => setMode(e.target.value as any)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="append">Append (add new records only)</option>
          <option value="upsert">Upsert (update or insert)</option>
          <option value="replace">Replace (delete all existing data)</option>
        </select>
      </div>

      {/* Dry Run */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isDryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Run in dry-run mode (preview without importing)</span>
        </label>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={clearError}
            className="text-red-600 text-xs mt-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Progress */}
      {isImporting && progress && (
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Importing...</span>
            <span>{progress.current}/{progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded h-2">
            <div
              className="bg-blue-500 h-2 rounded transition-all"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Results Display */}
      {importResults && (
        <div className="bg-green-50 border border-green-200 rounded p-3 space-y-2">
          <p className="font-medium text-green-900">Import Results</p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-green-700">✓ Imported: {importResults.successCount}</p>
            </div>
            <div>
              <p className="text-yellow-700">⊘ Skipped: {importResults.skippedCount}</p>
            </div>
            <div>
              <p className="text-red-700">✗ Errors: {importResults.errorCount}</p>
            </div>
          </div>
          {importResults.errors.length > 0 && (
            <button
              onClick={downloadErrorReport}
              className="text-green-600 text-xs hover:underline"
            >
              Download error report
            </button>
          )}
          <button
            onClick={clearResults}
            className="text-green-600 text-xs hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={importDatabase}
          disabled={!selectedFile || isImporting}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isImporting ? 'Importing...' : 'Import Database'}
        </button>
        {isImporting && (
          <button
            onClick={cancelImport}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
```

---

## 11. API Endpoint Contracts (For Backend Reference)

### Export Endpoint

```typescript
// GET /api/admin/database/export
// Query Parameters:
//   - format: 'json' | 'yaml' | 'sql' (required)
//   - entities: comma-separated entity types (optional, all if omitted)
//   - includeSchema: boolean (default: true)
//   - includeMetadata: boolean (default: true)
//   - prettyPrint: boolean (default: true)
//   - preview: boolean (optional, returns preview instead of full export)
//
// Responses:
// Success (200): File blob with Content-Disposition header
// Error (400): { success: false, error: { code, message, details } }
// Error (401): Unauthorized
// Error (403): Forbidden (insufficient permissions)
// Error (500): Internal server error
```

### Import Endpoint

```typescript
// POST /api/admin/database/import
// Form Data:
//   - file: File (required, JSON/YAML/SQL)
//   - mode: 'append' | 'upsert' | 'replace' (required)
//   - dryRun: boolean (default: true)
//   - chunkSize: number (default: 1000)
//
// Response (200):
// {
//   success: true,
//   data: {
//     dryRun: boolean,
//     totalRecords: number,
//     successCount: number,
//     skippedCount: number,
//     errorCount: number,
//     warningCount: number,
//     errors: Array<{ rowNumber?, entityType, errorCode, errorMessage, suggestedFix? }>,
//     warnings: Array<{ message, rowNumber? }>,
//     importedEntities: string[],
//     startTime: ISO timestamp,
//     endTime: ISO timestamp,
//     duration: milliseconds,
//     timestamp: ISO timestamp
//   }
// }
//
// Response (400/422):
// {
//   success: false,
//   error: {
//     code: error code,
//     message: error message,
//     details: { ... }
//   }
// }
```

---

## 12. Best Practices & Patterns

### Error Handling Pattern

```typescript
try {
  await handleExport(format, entities, {
    onProgress: (p) => updateProgressBar(p),
    onComplete: (filename, size) => showSuccessMessage(filename),
    onError: (err) => showErrorWithRetry(err),
  })
} catch (error) {
  const context = getExportErrorMessage((error as ApiError).code)
  showDetailedError(context)
}
```

### Progress Tracking Pattern

```typescript
const { progress, ...rest } = useDatabaseExport()

useEffect(() => {
  if (progress) {
    updateProgressIndicator({
      percent: (progress.current / progress.total) * 100,
      label: progress.currentEntity ? `Exporting ${progress.currentEntity}` : 'Preparing export',
    })
  }
}, [progress])
```

### File Validation Pattern

```typescript
const handleFileSelect = (file: File) => {
  const validation = validateFile(file)

  if (!validation.valid) {
    // Show user-friendly error
    toast.error(`File error: ${validation.reason}`)
    return
  }

  // File is valid, proceed
  setSelectedFile(file)
}
```

### Dry-Run Workflow Pattern

```typescript
// 1. User selects file
// 2. User enables dry-run checkbox
// 3. User clicks "Import Database"
// 4. System sends request with dryRun=true
// 5. System displays results without modifying database
// 6. User reviews results
// 7. If satisfied, user unchecks dry-run and clicks again
// 8. System performs actual import
```

---

## Summary

This specification provides production-ready implementations for database export/import functionality:

**Files to Create:**
1. `/frontends/nextjs/src/lib/admin/export-import-types.ts` - Type definitions
2. `/frontends/nextjs/src/lib/admin/import-export-utils.ts` - Utility functions
3. `/frontends/nextjs/src/hooks/useDatabaseExport.ts` - Export hook
4. `/frontends/nextjs/src/lib/admin/export-handler.ts` - Export handler
5. `/frontends/nextjs/src/hooks/useDatabaseImport.ts` - Import hook
6. `/frontends/nextjs/src/lib/admin/import-handler.ts` - Import handler
7. `/frontends/nextjs/src/hooks/useImportResults.ts` - Results hook
8. `/frontends/nextjs/src/lib/admin/file-upload-handler.ts` - File upload handler
9. `/frontends/nextjs/src/lib/admin/export-import-errors.ts` - Error handling

**Key Features:**
- Complete type safety
- Retry logic for network resilience
- Progress tracking with cancellation
- Dry-run mode for safe imports
- Comprehensive error handling
- File format detection and validation
- Results display and error reporting
- Integration examples for UI components

**Integration Points:**
- Works with existing `/api/admin/database/export` endpoint
- Works with existing `/api/admin/database/import` endpoint
- Uses standardized API response format
- Compatible with existing retry and error patterns

All implementations follow MetaBuilder conventions (one lambda per file, composable functions, error-first patterns).
