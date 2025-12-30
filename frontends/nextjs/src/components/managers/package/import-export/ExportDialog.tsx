import { Database as DatabaseIcon, Export, FileArrowDown, Package } from '@/fakemui/icons'
import type React from 'react'

import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Separator,
} from '@/components/ui'
import type { PackageManifest } from '@/lib/package-types'
import type { ExportPackageOptions } from '@/lib/packages/core/package-export'

import { ExportManifestForm } from './ExportManifestForm'
import { ExportOptions } from './ExportOptions'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  manifest: Partial<PackageManifest>
  setManifest: React.Dispatch<React.SetStateAction<Partial<PackageManifest>>>
  tagInput: string
  setTagInput: (value: string) => void
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
  exportOptions: ExportPackageOptions
  setExportOptions: React.Dispatch<React.SetStateAction<ExportPackageOptions>>
  exporting: boolean
  onExport: () => void
  onExportSnapshot: () => void
}

export const ExportDialog = ({
  open,
  onOpenChange,
  manifest,
  setManifest,
  tagInput,
  setTagInput,
  onAddTag,
  onRemoveTag,
  exportOptions,
  setExportOptions,
  exporting,
  onExport,
  onExportSnapshot,
}: ExportDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
            <Export size={24} weight="duotone" className="text-white" />
          </div>
          <div>
            <DialogTitle>Export Package</DialogTitle>
            <DialogDescription>Create a shareable package or database snapshot</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                    <Package size={20} className="text-white" />
                  </div>
                  <CardTitle className="text-base">Custom Package</CardTitle>
                </div>
                <CardDescription>Export selected data as a reusable package</CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={onExportSnapshot}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <DatabaseIcon size={20} className="text-white" />
                  </div>
                  <CardTitle className="text-base">Full Snapshot</CardTitle>
                </div>
                <CardDescription>Export entire database as backup</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Separator />

          <ExportManifestForm
            manifest={manifest}
            setManifest={setManifest}
            tagInput={tagInput}
            setTagInput={setTagInput}
            onAddTag={onAddTag}
            onRemoveTag={onRemoveTag}
          />

          <Separator />

          <ExportOptions exportOptions={exportOptions} setExportOptions={setExportOptions} />
        </div>
      </ScrollArea>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={onExport} disabled={exporting || !manifest.name}>
          {exporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Exporting...
            </>
          ) : (
            <>
              <FileArrowDown size={16} className="mr-2" />
              Export Package
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
