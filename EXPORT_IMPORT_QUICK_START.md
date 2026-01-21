# Export/Import Implementation Quick Start

**Status**: Ready for Development
**Difficulty**: Medium (HTTP handlers, file I/O, React hooks)
**Time Estimate**: 4-6 hours

## Quick Reference

### Files to Create (In Order)

```
1. frontends/nextjs/src/lib/admin/export-import-types.ts      [Types]
2. frontends/nextjs/src/lib/admin/import-export-utils.ts      [Core Utils]
3. frontends/nextjs/src/lib/admin/export-import-errors.ts     [Error Handling]
4. frontends/nextjs/src/lib/admin/file-upload-handler.ts      [File Upload]
5. frontends/nextjs/src/hooks/useDatabaseExport.ts            [Export Hook]
6. frontends/nextjs/src/lib/admin/export-handler.ts           [Export Handler]
7. frontends/nextjs/src/hooks/useDatabaseImport.ts            [Import Hook]
8. frontends/nextjs/src/lib/admin/import-handler.ts           [Import Handler]
9. frontends/nextjs/src/hooks/useImportResults.ts             [Results Hook]
```

### Implementation Order

**Phase 1: Foundation (30 min)**
1. Create `export-import-types.ts` - All type definitions
2. Create `import-export-utils.ts` - Utility functions
3. Create `export-import-errors.ts` - Error mappings

**Phase 2: Export (90 min)**
4. Create `export-handler.ts` - Core export logic
5. Create `useDatabaseExport.ts` - Export hook
6. Test with existing `/api/admin/database/export` endpoint

**Phase 3: Import (90 min)**
7. Create `import-handler.ts` - Core import logic
8. Create `file-upload-handler.ts` - File selection logic
9. Create `useDatabaseImport.ts` - Import hook
10. Create `useImportResults.ts` - Results display

**Phase 4: Integration (30 min)**
- Add to `frontends/nextjs/src/hooks/index.ts` (re-exports)
- Update Database page to use hooks
- Test with UI components

---

## Copy-Paste Ready Code

### Step 1: Create Type Definitions

**File**: `frontends/nextjs/src/lib/admin/export-import-types.ts`

Copy from full spec above. All 9 interfaces included.

### Step 2: Create Utilities

**File**: `frontends/nextjs/src/lib/admin/import-export-utils.ts`

Key functions to implement:
```typescript
export function detectFormat(file: File): FileFormat { ... }
export function validateFile(file: File): FileValidationResult { ... }
export function formatFileSize(bytes: number): string { ... }
export function generateExportFilename(format: FileFormat, timestamp?: Date): string { ... }
export function readFileAsText(file: File): Promise<string> { ... }
export function downloadBlob(blob: Blob, filename: string): void { ... }
export function generateErrorReport(errors: Array<...>): string { ... }
```

### Step 3: Create Error Handler

**File**: `frontends/nextjs/src/lib/admin/export-import-errors.ts`

Key exports:
```typescript
export const EXPORT_ERRORS = { ... }
export const IMPORT_ERRORS = { ... }
export function getExportErrorMessage(code: string): ErrorContext { ... }
export function getImportErrorMessage(code: string): ErrorContext { ... }
export function parseApiError(response: unknown): ErrorContext { ... }
```

### Step 4: Create Export Handler

**File**: `frontends/nextjs/src/lib/admin/export-handler.ts`

```typescript
export async function handleExport(
  format: ExportFormat,
  entityTypes?: string[],
  options?: Partial<ExportHandlerOptions>
): Promise<{ filename: string; size: number }>
```

Usage:
```typescript
const { filename, size } = await handleExport('json', ['users', 'credentials'], {
  onProgress: (p) => console.log(`${p.current}/${p.total}`),
  onComplete: (name, size) => console.log(`Downloaded: ${name} (${size} bytes)`),
  onError: (err) => console.error(err),
})
```

### Step 5: Create Export Hook

**File**: `frontends/nextjs/src/hooks/useDatabaseExport.ts`

```typescript
export function useDatabaseExport(): UseExportReturn {
  // Return object with:
  // - selectedFormat, selectedEntities, isExporting, error, progress
  // - setFormat(format), setEntities(entities), exportDatabase(), cancelExport(), clearError()
}
```

Usage:
```typescript
const { selectedFormat, setFormat, exportDatabase, isExporting } = useDatabaseExport()

return (
  <>
    <select value={selectedFormat} onChange={(e) => setFormat(e.target.value)}>
      <option value="json">JSON</option>
      <option value="yaml">YAML</option>
      <option value="sql">SQL</option>
    </select>
    <button onClick={exportDatabase} disabled={isExporting}>
      {isExporting ? 'Exporting...' : 'Export'}
    </button>
  </>
)
```

### Step 6: Create File Upload Handler

**File**: `frontends/nextjs/src/lib/admin/file-upload-handler.ts`

```typescript
export function createFileUploadHandler(options: FileUploadHandlerOptions) {
  return {
    handleDragEnter: (e) => { ... },
    handleDragLeave: (e) => { ... },
    handleDragOver: (e) => { ... },
    handleDrop: (e) => { ... },
    handleInputChange: (e) => { ... },
    handleFile: (f) => { ... },
  }
}
```

Usage:
```typescript
const uploadHandler = createFileUploadHandler({
  onFileSelect: (file) => setSelectedFile(file),
  onFileError: (err) => toast.error(err),
})

return (
  <div
    onDrop={uploadHandler.handleDrop}
    onDragOver={uploadHandler.handleDragOver}
    onDragEnter={uploadHandler.handleDragEnter}
    onDragLeave={uploadHandler.handleDragLeave}
  >
    <input
      type="file"
      onChange={uploadHandler.handleInputChange}
      accept=".json,.yaml,.sql"
    />
  </div>
)
```

### Step 7: Create Import Handler

**File**: `frontends/nextjs/src/lib/admin/import-handler.ts`

```typescript
export async function handleImport(
  file: File,
  options?: Partial<ImportHandlerOptions>
): Promise<ImportResults>
```

Usage:
```typescript
const results = await handleImport(file, {
  mode: 'upsert',
  dryRun: true,
  onProgress: (p) => updateProgress(p),
  onComplete: (r) => displayResults(r),
  onError: (e) => showError(e),
})

console.log(`Imported: ${results.successCount}, Errors: ${results.errorCount}`)
```

### Step 8: Create Import Hook

**File**: `frontends/nextjs/src/hooks/useDatabaseImport.ts`

```typescript
export function useDatabaseImport(): UseImportReturn {
  // Return object with:
  // - selectedFile, importMode, isDryRun, isImporting, importResults, error, progress
  // - setFile(file), setMode(mode), setDryRun(enabled), importDatabase(), etc.
}
```

Usage:
```typescript
const { selectedFile, setFile, importMode, setMode, importDatabase } = useDatabaseImport()

return (
  <>
    <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
    <select value={importMode} onChange={(e) => setMode(e.target.value)}>
      <option value="append">Append</option>
      <option value="upsert">Upsert</option>
      <option value="replace">Replace</option>
    </select>
    <button onClick={importDatabase} disabled={!selectedFile}>
      Import
    </button>
  </>
)
```

### Step 9: Create Results Hook

**File**: `frontends/nextjs/src/hooks/useImportResults.ts`

```typescript
export function useImportResults(): UseImportResultsReturn {
  return {
    results,
    isShowing,
    showResults: (r) => { ... },
    dismissResults: () => { ... },
    downloadErrorReport: () => { ... },
  }
}
```

---

## Testing Checklist

### Export Testing
- [ ] Export with JSON format
- [ ] Export with YAML format
- [ ] Export with SQL format
- [ ] Export with specific entities selected
- [ ] Export with all entities (empty selection)
- [ ] Export shows progress
- [ ] Cancel export works
- [ ] File downloads with correct name
- [ ] Handle network timeout (verify retry works)
- [ ] Handle permission error
- [ ] Handle server error

### Import Testing
- [ ] Select file via click
- [ ] Select file via drag-and-drop
- [ ] Validate file size limit
- [ ] Validate file format
- [ ] Reject unsupported formats
- [ ] Import with dry-run enabled
- [ ] Import with dry-run disabled
- [ ] Import with "append" mode
- [ ] Import with "upsert" mode
- [ ] Import with "replace" mode
- [ ] Cancel import works
- [ ] Display results correctly
- [ ] Download error report
- [ ] Handle network timeout (verify retry works)
- [ ] Handle permission error
- [ ] Handle validation errors

### Integration Testing
- [ ] Export hook integrates with database page
- [ ] Import hook integrates with database page
- [ ] Error messages display correctly
- [ ] Progress bars update smoothly
- [ ] File info displays with human-readable size
- [ ] Dry-run mode prevents data modification
- [ ] Results show breakdown of success/skip/error

---

## Common Issues & Solutions

### Issue: "Cannot find module '@/lib/admin/export-import-types'"

**Solution**: Make sure the file is created in the correct directory:
```
frontends/nextjs/src/lib/admin/export-import-types.ts
```

### Issue: File download doesn't trigger

**Solution**: Check that `downloadBlob` function uses correct pattern:
```typescript
const url = URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
link.download = filename
document.body.appendChild(link)
link.click()
document.body.removeChild(link)
URL.revokeObjectURL(url)
```

### Issue: Progress bar shows 0%

**Solution**: Ensure `onProgress` callback is called during fetch:
```typescript
if (onProgress && totalSize > 0) {
  onProgress({
    current: receivedSize,
    total: totalSize,
  })
}
```

### Issue: Import results show but errors don't display

**Solution**: Check that error parsing is correct:
```typescript
const results = result.data as ImportResults
// Ensure results.errors is array of error objects with proper structure
```

### Issue: Drag-and-drop not working

**Solution**: Make sure to call `preventDefault()` on all drag events:
```typescript
const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
  e.preventDefault()    // Required!
  e.stopPropagation()   // Required!
}
```

---

## Performance Tips

### Large File Exports
- Stream response using `response.body?.getReader()` (implemented in spec)
- Show progress bar with bytes received vs total
- Allow cancellation via AbortController

### Large File Imports
- Process in chunks (default 1000 records)
- Show progress during import
- Use dry-run mode first for validation

### Memory Efficiency
- Don't load entire file into memory for parsing
- Use `readFileAsText()` which streams data
- Clear blob URL with `URL.revokeObjectURL()` after download

---

## Integration with Database Page

Add these hooks to your database admin page:

```typescript
import { useDatabaseExport } from '@/hooks/useDatabaseExport'
import { useDatabaseImport } from '@/hooks/useDatabaseImport'
import { useImportResults } from '@/hooks/useImportResults'

export function DatabaseAdminPage() {
  const exportHook = useDatabaseExport()
  const importHook = useDatabaseImport()
  const resultsHook = useImportResults()

  return (
    <Tabs>
      <Tab label="Export">
        <DatabaseExportTab {...exportHook} />
      </Tab>
      <Tab label="Import">
        <DatabaseImportTab {...importHook} />
      </Tab>
      {resultsHook.isShowing && (
        <ImportResultsModal
          results={resultsHook.results}
          onClose={resultsHook.dismissResults}
          onDownloadErrors={resultsHook.downloadErrorReport}
        />
      )}
    </Tabs>
  )
}
```

---

## API Endpoint Implementation Notes

For backend developers implementing the API endpoints:

### Export Endpoint Spec
```
GET /api/admin/database/export
Query Params:
  - format: 'json'|'yaml'|'sql'
  - entities: comma-separated list (optional)
  - includeSchema: boolean (default true)
  - includeMetadata: boolean (default true)
  - prettyPrint: boolean (default true)

Response Headers:
  - Content-Type: application/json|text/yaml|text/sql
  - Content-Disposition: attachment; filename="..."
  - Content-Length: (for progress tracking)

Response: File blob (stream)
```

### Import Endpoint Spec
```
POST /api/admin/database/import
Body: multipart/form-data
  - file: File (json, yaml, or sql)
  - mode: 'append'|'upsert'|'replace'
  - dryRun: boolean
  - chunkSize: number (optional)

Response (200):
{
  success: true,
  data: {
    dryRun: boolean,
    totalRecords: number,
    successCount: number,
    skippedCount: number,
    errorCount: number,
    warningCount: number,
    errors: [
      {
        rowNumber: number,
        entityType: string,
        errorCode: string,
        errorMessage: string,
        suggestedFix: string
      }
    ],
    importedEntities: string[],
    startTime: ISO timestamp,
    endTime: ISO timestamp,
    duration: milliseconds,
    timestamp: ISO timestamp
  }
}
```

---

## Re-exports (Update hooks/index.ts)

Add to `/frontends/nextjs/src/hooks/index.ts`:

```typescript
export { useDatabaseExport } from './useDatabaseExport'
export { useDatabaseImport } from './useDatabaseImport'
export { useImportResults } from './useImportResults'
```

Add to `/frontends/nextjs/src/lib/admin/index.ts` (create if needed):

```typescript
export * from './export-import-types'
export * from './import-export-utils'
export * from './export-import-errors'
export * from './export-handler'
export * from './import-handler'
export * from './file-upload-handler'
```

---

## Next Steps After Implementation

1. **Unit Tests**: Test each utility function independently
2. **Integration Tests**: Test hooks with mock API responses
3. **E2E Tests**: Test full workflow in browser
4. **Performance Testing**: Test with large files (50MB+)
5. **Error Scenarios**: Test all error conditions
6. **Documentation**: Add JSDoc comments to all functions
7. **UI Components**: Create reusable export/import components

---

## Related Files

- Full implementation: `EXPORT_IMPORT_IMPLEMENTATION_SPEC.md`
- API contracts: Section 11 in full spec
- Error handling: `export-import-errors.ts`
- Type definitions: `export-import-types.ts`
- Utilities: `import-export-utils.ts`

---

## Support

For questions about implementation:
1. Check the full spec for detailed examples
2. Review integration examples in Section 10 of full spec
3. Check common issues section above
4. Reference existing patterns in codebase (useAuth, useDBAL, etc.)
