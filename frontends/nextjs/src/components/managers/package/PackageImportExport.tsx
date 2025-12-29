import { useRef, useState } from 'react'
import { toast } from 'sonner'

import type { PackageManifest } from '@/lib/package-types'
import type { ExportPackageOptions } from '@/lib/packages/core/package-export'

import { createFileSelector } from './import-export/createFileSelector'
import { defaultExportOptions, defaultManifest } from './import-export/defaults'
import { executePackageImport } from './import-export/executePackageImport'
import { ExportDialog } from './import-export/ExportDialog'
import { generatePackageExport } from './import-export/generatePackageExport'
import { generateSnapshotExport } from './import-export/generateSnapshotExport'
import { ImportDialog } from './import-export/ImportDialog'
import { validateManifest } from './import-export/validateManifest'

interface PackageImportExportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'export' | 'import'
}

const createInitialManifest = () => ({
  ...defaultManifest,
  tags: [...(defaultManifest.tags || [])],
})
const createInitialExportOptions = () => ({ ...defaultExportOptions })

export function PackageImportExport({ open, onOpenChange, mode }: PackageImportExportProps) {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportPackageOptions>(
    createInitialExportOptions
  )
  const [manifest, setManifest] = useState<Partial<PackageManifest>>(createInitialManifest)
  const [tagInput, setTagInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    const validationError = validateManifest(manifest)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setExporting(true)
    try {
      await generatePackageExport(manifest, exportOptions)
      toast.success('Package exported successfully!')
      onOpenChange(false)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export package')
    } finally {
      setExporting(false)
    }
  }

  const handleExportSnapshot = async () => {
    setExporting(true)
    try {
      await generateSnapshotExport()
      toast.success('Database snapshot exported successfully!')
      onOpenChange(false)
    } catch (error) {
      console.error('Snapshot export error:', error)
      toast.error('Failed to export database snapshot')
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (file: File) => {
    setImporting(true)
    try {
      const { manifest: importedManifest, content, assets } = await executePackageImport(file)
      toast.success(`Package "${importedManifest.name}" imported successfully!`)
      toast.info(
        `Imported: ${content.schemas.length} schemas, ${content.pages.length} pages, ${content.workflows.length} workflows, ${assets.length} assets`
      )
      onOpenChange(false)
    } catch (error) {
      console.error('Import error:', error)
      toast.error(
        `Failed to import package: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      setImporting(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !manifest.tags?.includes(tagInput.trim())) {
      setManifest(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setManifest(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag),
    }))
  }

  const handleFileSelect = createFileSelector(handleImport, message => toast.error(message))

  if (mode === 'import') {
    return (
      <ImportDialog
        open={open}
        onOpenChange={onOpenChange}
        fileInputRef={fileInputRef}
        onFileSelect={handleFileSelect}
        importing={importing}
      />
    )
  }

  return (
    <ExportDialog
      open={open}
      onOpenChange={onOpenChange}
      manifest={manifest}
      setManifest={setManifest}
      tagInput={tagInput}
      setTagInput={setTagInput}
      onAddTag={handleAddTag}
      onRemoveTag={handleRemoveTag}
      exportOptions={exportOptions}
      setExportOptions={setExportOptions}
      exporting={exporting}
      onExport={handleExport}
      onExportSnapshot={handleExportSnapshot}
    />
  )
}
