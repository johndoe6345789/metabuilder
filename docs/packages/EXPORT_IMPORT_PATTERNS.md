# Export/Import Implementation Patterns & Examples

**Reference Guide for Common Patterns and Use Cases**

---

## Pattern 1: Complete Export Workflow

This pattern shows a complete export from start to finish:

```typescript
import { useDatabaseExport } from '@/hooks/useDatabaseExport'
import { getDefaultEntityTypes, formatEntityName } from '@/lib/admin/import-export-utils'
import { getExportErrorMessage } from '@/lib/admin/export-import-errors'

function ExportWorkflow() {
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

  const [succeeded, setSucceeded] = React.useState(false)

  const handleExport = async () => {
    try {
      setSucceeded(false)
      await exportDatabase()
      setSucceeded(true)
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSucceeded(false), 3000)
    } catch (err) {
      // Error is already in hook state
      console.error(err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Export Database</h1>

      {/* Format Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">1. Select Format</h2>
        <div className="grid grid-cols-3 gap-2">
          {(['json', 'yaml', 'sql'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`py-2 px-3 rounded border-2 transition ${
                selectedFormat === fmt
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {fmt === 'json' && '📄'}
              {fmt === 'yaml' && '📋'}
              {fmt === 'sql' && '🗄️'}
              <br />
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Entity Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">2. Select Entities</h2>
        <div className="bg-gray-50 border rounded p-3 max-h-48 overflow-y-auto space-y-2">
          {getDefaultEntityTypes().map((entity) => (
            <label
              key={entity}
              className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded"
            >
              <input
                type="checkbox"
                checked={selectedEntities.includes(entity)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...selectedEntities, entity]
                    : selectedEntities.filter((e) => e !== entity)
                  setEntities(updated)
                }}
                className="rounded"
              />
              <span className="text-sm">{formatEntityName(entity)}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {selectedEntities.length === 0
            ? '✓ All entities will be exported'
            : `✓ ${selectedEntities.length} entities selected`}
        </p>
      </div>

      {/* Status Messages */}
      {succeeded && (
        <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded text-green-800 text-sm">
          ✓ Export completed successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-800 text-sm">
          <div className="font-semibold">Export failed</div>
          <div>{error}</div>
          <button
            onClick={clearError}
            className="text-red-600 underline text-xs mt-2 hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Progress */}
      {isExporting && progress && (
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Exporting...</span>
            <span>
              {progress.current} / {progress.total} records
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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
          onClick={handleExport}
          disabled={isExporting}
          className="flex-1 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isExporting ? 'Exporting...' : 'Export Database'}
        </button>
        {isExporting && (
          <button
            onClick={cancelExport}
            className="py-2 px-4 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

export default ExportWorkflow
```

---

## Pattern 2: Complete Import Workflow

This pattern shows a complete import with dry-run and error handling:

```typescript
import { useDatabaseImport } from '@/hooks/useDatabaseImport'
import { useImportResults } from '@/hooks/useImportResults'
import { createFileUploadHandler, formatFileInfo } from '@/lib/admin/file-upload-handler'

function ImportWorkflow() {
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
      // Show error in UI
      clearError()
    },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  })

  const canImport = selectedFile && !isImporting

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Import Database</h1>

      {/* File Upload Area */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">1. Select File</h2>
        {!selectedFile ? (
          <div
            onDragEnter={uploadHandler.handleDragEnter}
            onDragLeave={uploadHandler.handleDragLeave}
            onDragOver={uploadHandler.handleDragOver}
            onDrop={uploadHandler.handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
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
              <div className="font-semibold text-gray-900 mb-1">Drag files here or click to browse</div>
              <div className="text-sm text-gray-600">Supported formats: JSON, YAML, SQL</div>
              <div className="text-xs text-gray-500 mt-1">Maximum file size: 100 MB</div>
            </label>
          </div>
        ) : (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-blue-900">{selectedFile.name}</div>
                <div className="text-sm text-blue-700 mt-1">{formatFileInfo(selectedFile)}</div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-blue-600 hover:text-blue-800 text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import Mode Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">2. Select Import Mode</h2>
        <div className="space-y-2">
          {(['append', 'upsert', 'replace'] as const).map((mode) => (
            <label
              key={mode}
              className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="import-mode"
                value={mode}
                checked={importMode === mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="mt-1"
              />
              <div>
                <div className="font-semibold text-sm capitalize">{mode}</div>
                <div className="text-xs text-gray-600">
                  {mode === 'append' && 'Add new records, skip existing'}
                  {mode === 'upsert' && 'Update existing records, add new ones'}
                  {mode === 'replace' && 'Delete all existing data and import new (⚠️ cannot undo)'}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Dry Run Toggle */}
      <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isDryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            className="rounded"
          />
          <span className="font-semibold text-yellow-900">Preview mode (dry-run)</span>
        </label>
        <p className="text-xs text-yellow-800 mt-2">
          ✓ Test the import without modifying the database. Review the results and run again with this unchecked to commit changes.
        </p>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-800 text-sm space-y-2">
          <div className="font-semibold">Import failed</div>
          <div>{error}</div>
          <button
            onClick={clearError}
            className="text-red-600 underline text-xs hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Progress */}
      {isImporting && progress && (
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Importing...</span>
            <span>
              {progress.current} / {progress.total} records
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Results Display */}
      {importResults && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded space-y-3">
          <div className="font-semibold text-blue-900">Import Results</div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-white p-2 rounded border border-green-200">
              <div className="text-green-700 font-semibold">{importResults.successCount}</div>
              <div className="text-xs text-gray-600">Imported</div>
            </div>
            <div className="bg-white p-2 rounded border border-yellow-200">
              <div className="text-yellow-700 font-semibold">{importResults.skippedCount}</div>
              <div className="text-xs text-gray-600">Skipped</div>
            </div>
            <div className="bg-white p-2 rounded border border-red-200">
              <div className="text-red-700 font-semibold">{importResults.errorCount}</div>
              <div className="text-xs text-gray-600">Errors</div>
            </div>
          </div>
          {importResults.dryRun && (
            <div className="text-xs text-blue-700 font-semibold">🔍 This was a preview. Run again to import.</div>
          )}
          <div className="flex gap-2 flex-wrap">
            {importResults.errors.length > 0 && (
              <button
                onClick={downloadErrorReport}
                className="text-xs text-blue-600 hover:underline"
              >
                📥 Download error report
              </button>
            )}
            <button
              onClick={clearResults}
              className="text-xs text-blue-600 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={importDatabase}
          disabled={!canImport}
          className="flex-1 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
        >
          {isImporting ? 'Importing...' : isDryRun ? 'Preview Import' : 'Import Database'}
        </button>
        {isImporting && (
          <button
            onClick={cancelImport}
            className="py-2 px-4 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

export default ImportWorkflow
```

---

## Pattern 3: Error Handling with Retry Logic

This pattern shows how to handle errors with user-friendly messages and retry:

```typescript
async function handleExportWithErrorRetry(
  format: 'json' | 'yaml' | 'sql',
  entityTypes: string[]
) {
  const maxAttempts = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Export attempt ${attempt}/${maxAttempts}`)

      const response = await fetch(
        `/api/admin/database/export?format=${format}&entities=${entityTypes.join(',')}`
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.error?.message || `HTTP ${response.status}`)
      }

      // Success
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `metabuilder-export-${Date.now()}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return { success: true, attempt }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      // Log and wait before retry
      console.warn(`Export attempt ${attempt} failed:`, lastError.message)

      if (attempt < maxAttempts) {
        const delay = Math.pow(2, attempt - 1) * 1000 // Exponential backoff
        console.log(`Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  // All attempts failed
  throw new Error(
    `Export failed after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`
  )
}
```

---

## Pattern 4: File Validation Before Upload

This pattern validates files comprehensively before allowing upload:

```typescript
async function validateAndPrepareFile(file: File): Promise<{
  valid: boolean
  issues: string[]
  file?: File
}> {
  const issues: string[] = []

  // Check file size
  const maxSizeMB = 100
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > maxSizeMB) {
    issues.push(`File size ${fileSizeMB.toFixed(2)}MB exceeds limit of ${maxSizeMB}MB`)
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!['json', 'yaml', 'yml', 'sql'].includes(extension ?? '')) {
    issues.push(
      `Invalid file extension: .${extension}. Expected: .json, .yaml, .yml, or .sql`
    )
  }

  // Try to parse file to validate structure
  if (issues.length === 0) {
    try {
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = (e) => reject(e)
        reader.readAsText(file)
      })

      if (extension === 'json') {
        JSON.parse(text)
      } else if (['yaml', 'yml'].includes(extension ?? '')) {
        // Simple YAML validation (check for valid structure)
        if (!text.includes(':')) {
          issues.push('YAML file appears to be invalid (no key-value pairs found)')
        }
      }
      // SQL files are harder to validate, skip
    } catch (error) {
      issues.push(
        `File parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    file: issues.length === 0 ? file : undefined,
  }
}
```

---

## Pattern 5: Progress Tracking with Cancellation

This pattern shows how to track progress and allow cancellation:

```typescript
async function exportWithCancellation(
  format: 'json' | 'yaml' | 'sql',
  entityTypes: string[],
  onProgress?: (progress: { current: number; total: number; percent: number }) => void,
  signal?: AbortSignal
) {
  const abortController = signal ? new AbortController() : new AbortController()

  const params = new URLSearchParams({
    format,
    entities: entityTypes.join(','),
  })

  const response = await fetch(`/api/admin/database/export?${params}`, {
    signal: abortController.signal,
  })

  const contentLength = response.headers.get('content-length')
  const total = contentLength ? parseInt(contentLength, 10) : 0

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  let current = 0
  const chunks: Uint8Array[] = []

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      chunks.push(value)
      current += value.length

      if (onProgress && total > 0) {
        onProgress({
          current,
          total,
          percent: (current / total) * 100,
        })
      }

      // Allow cancellation check
      if (signal?.aborted) {
        reader.cancel()
        throw new Error('Export cancelled')
      }
    }
  } finally {
    reader.releaseLock()
  }

  const blob = new Blob(chunks)
  return blob
}

// Usage
const abortController = new AbortController()

const promise = exportWithCancellation(
  'json',
  ['users'],
  (progress) => {
    console.log(`${progress.percent.toFixed(0)}% - ${progress.current}/${progress.total}`)
    updateProgressBar(progress.percent)
  },
  abortController.signal
)

// Cancel if needed
setTimeout(() => {
  abortController.abort()
}, 5000)
```

---

## Pattern 6: Batch Import with Chunking

This pattern shows how to import large files in chunks:

```typescript
async function importWithChunking(
  file: File,
  mode: 'append' | 'upsert' | 'replace',
  chunkSize: number = 1000,
  onProgress?: (progress: { current: number; total: number }) => void,
  onChunkComplete?: (results: { imported: number; errors: number }) => void
) {
  const formData = new FormData()
  formData.set('file', file)
  formData.set('mode', mode)
  formData.set('dryRun', 'false')
  formData.set('chunkSize', String(chunkSize))

  const response = await fetch('/api/admin/database/import', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Import failed: ${response.statusText}`)
  }

  const result = await response.json()
  const results = result.data

  // Progress tracking (simulated for chunk-based import)
  const totalChunks = Math.ceil(results.totalRecords / chunkSize)
  for (let i = 1; i <= totalChunks; i++) {
    if (onProgress) {
      onProgress({
        current: Math.min(i * chunkSize, results.totalRecords),
        total: results.totalRecords,
      })
    }

    if (onChunkComplete && i < totalChunks) {
      onChunkComplete({
        imported: Math.min(i * chunkSize, results.successCount),
        errors: results.errorCount,
      })
    }

    // Small delay to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return results
}
```

---

## Pattern 7: Dry-Run Workflow

This pattern shows the recommended dry-run -> actual import workflow:

```typescript
async function importWithDryRun(
  file: File,
  mode: 'append' | 'upsert' | 'replace'
): Promise<{
  dryRunPassed: boolean
  actualResults?: ImportResults
  dryRunResults: ImportResults
}> {
  console.log('Step 1: Running dry-run preview...')
  const dryRunResults = await performImport(file, mode, true)

  console.log(`Dry-run results: ${dryRunResults.successCount} imported, ${dryRunResults.errorCount} errors`)

  if (dryRunResults.errorCount > 0) {
    console.warn('Dry-run found errors. User should review before importing.')
    return {
      dryRunPassed: false,
      dryRunResults,
    }
  }

  // If dry-run passed, proceed with actual import
  console.log('Step 2: Dry-run passed, performing actual import...')
  const actualResults = await performImport(file, mode, false)

  console.log(`Actual results: ${actualResults.successCount} imported, ${actualResults.errorCount} errors`)

  return {
    dryRunPassed: true,
    dryRunResults,
    actualResults,
  }
}

async function performImport(
  file: File,
  mode: string,
  dryRun: boolean
): Promise<ImportResults> {
  const formData = new FormData()
  formData.set('file', file)
  formData.set('mode', mode)
  formData.set('dryRun', String(dryRun))

  const response = await fetch('/api/admin/database/import', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Import failed: ${response.statusText}`)
  }

  const result = await response.json()
  return result.data
}
```

---

## Pattern 8: Error Report Generation and Display

This pattern shows how to generate and display error reports:

```typescript
function displayErrorReport(results: ImportResults) {
  if (results.errors.length === 0) {
    console.log('No errors to report')
    return
  }

  // Group errors by type
  const errorsByCode = new Map<string, typeof results.errors>()
  for (const error of results.errors) {
    if (!errorsByCode.has(error.errorCode)) {
      errorsByCode.set(error.errorCode, [])
    }
    errorsByCode.get(error.errorCode)!.push(error)
  }

  // Display summary
  console.group('Error Report Summary')
  console.log(`Total errors: ${results.errorCount}`)
  for (const [code, errors] of errorsByCode) {
    console.log(`${code}: ${errors.length} occurrence(s)`)
  }
  console.groupEnd()

  // Display details
  console.group('Error Details')
  for (const error of results.errors.slice(0, 10)) {
    // Show first 10
    console.log(`Row ${error.rowNumber || 'N/A'}:`, {
      entity: error.entityType,
      code: error.errorCode,
      message: error.errorMessage,
      suggestion: error.suggestedFix,
    })
  }
  if (results.errors.length > 10) {
    console.log(`... and ${results.errors.length - 10} more errors`)
  }
  console.groupEnd()

  // Generate downloadable report
  const csv = generateCSVReport(results.errors)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `import-errors-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function generateCSVReport(errors: ImportError[]): string {
  const headers = ['Row Number', 'Entity Type', 'Error Code', 'Error Message', 'Suggestion']
  const rows = errors.map((e) => [
    e.rowNumber?.toString() ?? 'N/A',
    e.entityType,
    e.errorCode,
    `"${e.errorMessage.replace(/"/g, '""')}"`, // Escape quotes
    e.suggestedFix ? `"${e.suggestedFix.replace(/"/g, '""')}"` : 'N/A',
  ])

  const csv = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n')

  return csv
}
```

---

## Pattern 9: Export Format Selection with Previews

This pattern shows how to let users preview what will be exported:

```typescript
async function getExportPreview(
  entityTypes?: string[]
): Promise<Array<{ entity: string; count: number; sizeEstimate: string }>> {
  const params = new URLSearchParams({
    preview: 'true',
  })

  if (entityTypes && entityTypes.length > 0) {
    params.set('entities', entityTypes.join(','))
  }

  const response = await fetch(`/api/admin/database/export?${params}`)

  if (!response.ok) {
    throw new Error('Failed to get preview')
  }

  const data = await response.json()
  return data.data?.preview ?? []
}

// Usage
function ExportPreview() {
  const [preview, setPreview] = React.useState<ExportPreviewItem[] | null>(null)
  const [selectedEntities, setSelectedEntities] = React.useState<string[]>([])

  React.useEffect(() => {
    getExportPreview(selectedEntities.length > 0 ? selectedEntities : undefined)
      .then(setPreview)
      .catch(console.error)
  }, [selectedEntities])

  if (!preview) return <div>Loading preview...</div>

  const totalRecords = preview.reduce((sum, item) => sum + item.count, 0)
  const totalSize = `~${(totalRecords * 0.5).toFixed(0)} KB` // Rough estimate

  return (
    <div>
      <div className="text-sm text-gray-600 mb-3">
        Export size estimate: <strong>{totalSize}</strong> ({totalRecords} records)
      </div>
      <div className="space-y-2">
        {preview.map((item) => (
          <div key={item.entity} className="flex justify-between text-sm">
            <span>{item.entity}</span>
            <span className="text-gray-600">{item.count} records</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Pattern 10: Scheduled Exports

This pattern shows how to set up periodic database exports:

```typescript
class ScheduledExporter {
  private exportInterval: NodeJS.Timeout | null = null
  private isExporting = false

  /**
   * Start scheduled exports
   * @param intervalMinutes How often to export (e.g., 60 for hourly)
   * @param format Export format
   * @param entityTypes Entities to export
   */
  start(intervalMinutes: number, format: 'json' | 'yaml' | 'sql', entityTypes: string[]) {
    const intervalMs = intervalMinutes * 60 * 1000

    // Run immediately
    this.export(format, entityTypes)

    // Then schedule
    this.exportInterval = setInterval(() => {
      this.export(format, entityTypes)
    }, intervalMs)

    console.log(`Scheduled exports every ${intervalMinutes} minutes`)
  }

  private async export(format: string, entityTypes: string[]) {
    if (this.isExporting) {
      console.warn('Export already in progress, skipping')
      return
    }

    this.isExporting = true

    try {
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] Starting scheduled export...`)

      const params = new URLSearchParams({
        format,
        entities: entityTypes.join(','),
      })

      const response = await fetch(`/api/admin/database/export?${params}`)

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      const blob = await response.blob()
      const filename = `metabuilder-export-${timestamp.replace(/[:.]/g, '-')}.${format}`

      // Save to browser downloads
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)

      console.log(`[${timestamp}] Export completed: ${filename}`)
    } catch (error) {
      console.error(`Export failed:`, error)
    } finally {
      this.isExporting = false
    }
  }

  stop() {
    if (this.exportInterval) {
      clearInterval(this.exportInterval)
      this.exportInterval = null
      console.log('Scheduled exports stopped')
    }
  }
}

// Usage
const exporter = new ScheduledExporter()
exporter.start(60, 'json', ['users', 'credentials']) // Export JSON hourly
// Later...
exporter.stop()
```

---

## Common Pitfalls to Avoid

### ❌ Pitfall 1: Not Handling AbortController Cleanup
```typescript
// WRONG
const controller = new AbortController()
fetch(url, { signal: controller.signal })
// ... AbortController never cleaned up

// CORRECT
try {
  const controller = new AbortController()
  const response = await fetch(url, { signal: controller.signal })
} finally {
  controller.abort()
}
```

### ❌ Pitfall 2: Not Revoking Object URLs
```typescript
// WRONG
const url = URL.createObjectURL(blob)
link.href = url
link.click()
// URL never revoked, causes memory leak

// CORRECT
const url = URL.createObjectURL(blob)
try {
  link.href = url
  link.click()
} finally {
  URL.revokeObjectURL(url)
}
```

### ❌ Pitfall 3: Ignoring FormData Encoding
```typescript
// WRONG - File not encoded properly
const data = {
  file: selectedFile,
  mode: 'append',
}
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data), // Can't JSON.stringify File!
})

// CORRECT
const formData = new FormData()
formData.set('file', selectedFile)
formData.set('mode', 'append')
fetch(url, {
  method: 'POST',
  body: formData, // FormData handles multipart encoding
})
```

### ❌ Pitfall 4: Not Validating Before Processing
```typescript
// WRONG
async function handleImport(file: File) {
  const content = await readFileAsText(file)
  JSON.parse(content) // May throw!
}

// CORRECT
async function handleImport(file: File) {
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.reason)
  }

  const content = await readFileAsText(file)
  try {
    JSON.parse(content)
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`)
  }
}
```

### ❌ Pitfall 5: Not Cleaning Up Event Listeners
```typescript
// WRONG
function UploadComponent() {
  const handleDrop = (e: DragEvent) => { ... }

  return (
    <div onDrop={handleDrop}>
      {/* Drop zone */}
    </div>
  )
}
// If this component remounts, event handler leaks

// CORRECT
function UploadComponent() {
  const handleDrop = React.useCallback((e: DragEvent) => { ... }, [])

  return (
    <div onDrop={handleDrop}>
      {/* Drop zone */}
    </div>
  )
}
```

---

## Testing Patterns

### Test Pattern 1: Testing Export Hook
```typescript
import { renderHook, act } from '@testing-library/react'
import { useDatabaseExport } from '@/hooks/useDatabaseExport'

describe('useDatabaseExport', () => {
  it('should initialize with json format', () => {
    const { result } = renderHook(() => useDatabaseExport())
    expect(result.current.selectedFormat).toBe('json')
  })

  it('should update format when setFormat is called', () => {
    const { result } = renderHook(() => useDatabaseExport())
    act(() => {
      result.current.setFormat('yaml')
    })
    expect(result.current.selectedFormat).toBe('yaml')
  })

  it('should update selected entities', () => {
    const { result } = renderHook(() => useDatabaseExport())
    act(() => {
      result.current.setEntities(['users', 'credentials'])
    })
    expect(result.current.selectedEntities).toEqual(['users', 'credentials'])
  })
})
```

### Test Pattern 2: Testing File Validation
```typescript
import { validateFile } from '@/lib/admin/import-export-utils'

describe('File Validation', () => {
  it('should reject files over 100MB', () => {
    const largeFile = new File(['x'.repeat(101 * 1024 * 1024)], 'large.json')
    const result = validateFile(largeFile)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('FILE_TOO_LARGE')
  })

  it('should detect JSON format', () => {
    const file = new File(['{}'], 'data.json', { type: 'application/json' })
    const result = validateFile(file)
    expect(result.format).toBe('json')
  })

  it('should reject unsupported formats', () => {
    const file = new File(['data'], 'data.txt', { type: 'text/plain' })
    const result = validateFile(file)
    expect(result.valid).toBe(false)
  })
})
```

---

## Performance Optimization Tips

1. **Lazy Load Hooks**: Only create hooks when needed
2. **Memoize Callbacks**: Use `useCallback` for event handlers
3. **Stream Large Exports**: Use `response.body?.getReader()` for streaming
4. **Chunk Large Imports**: Process in batches instead of all at once
5. **Debounce Progress Updates**: Don't update progress on every byte
6. **Cancel Old Requests**: Abort previous requests before starting new ones
7. **Cleanup Resources**: Always revoke object URLs and close readers

---

See `EXPORT_IMPORT_IMPLEMENTATION_SPEC.md` for complete implementation details.
