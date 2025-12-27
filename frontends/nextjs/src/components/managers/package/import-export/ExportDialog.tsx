import type React from 'react'
import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui'
import { Label } from '@/components/ui'
import { Input } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Checkbox } from '@/components/ui'
import { ScrollArea } from '@/components/ui'
import { Separator } from '@/components/ui'
import { Export, Package, Database as DatabaseIcon, FileArrowDown } from '@phosphor-icons/react'
import type { PackageManifest } from '@/lib/package-types'
import type { ExportPackageOptions } from '@/lib/packages/core/package-export'

const exportOptionLabels: { key: keyof ExportPackageOptions; label: string }[] = [
  { key: 'includeSchemas', label: 'Include data schemas' },
  { key: 'includePages', label: 'Include page configurations' },
  { key: 'includeWorkflows', label: 'Include workflows' },
  { key: 'includeLuaScripts', label: 'Include Lua scripts' },
  { key: 'includeComponentHierarchy', label: 'Include component hierarchies' },
  { key: 'includeComponentConfigs', label: 'Include component configurations' },
  { key: 'includeCssClasses', label: 'Include CSS classes' },
  { key: 'includeDropdownConfigs', label: 'Include dropdown configurations' },
  { key: 'includeSeedData', label: 'Include seed data' },
  { key: 'includeAssets', label: 'Include assets (images, videos, audio, documents)' },
]

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

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={onExportSnapshot}>
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

          <div className="space-y-4">
            <div>
              <Label htmlFor="package-name">Package Name *</Label>
              <Input
                id="package-name"
                placeholder="My Awesome Package"
                value={manifest.name}
                onChange={e => setManifest(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="package-version">Version</Label>
                <Input
                  id="package-version"
                  placeholder="1.0.0"
                  value={manifest.version}
                  onChange={e => setManifest(prev => ({ ...prev, version: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="package-author">Author</Label>
                <Input
                  id="package-author"
                  placeholder="Your Name"
                  value={manifest.author}
                  onChange={e => setManifest(prev => ({ ...prev, author: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="package-description">Description</Label>
              <Textarea
                id="package-description"
                placeholder="Describe what this package does..."
                value={manifest.description}
                onChange={e => setManifest(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="package-tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="package-tags"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onAddTag())}
                />
                <Button type="button" onClick={onAddTag}>
                  Add
                </Button>
              </div>
              {manifest.tags && manifest.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {manifest.tags.map(tag => (
                    <div key={tag} className="px-2 py-1 bg-secondary rounded-md text-sm flex items-center gap-2">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveTag(tag)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

            <div>
              <Label className="mb-3 block">Export Options</Label>
              <div className="space-y-3">
                {exportOptionLabels.map(({ key, label }) => (
                  <div className="flex items-center gap-2" key={key}>
                    <Checkbox
                      id={`export-${key}`}
                      checked={exportOptions[key] as boolean}
                      onCheckedChange={checked =>
                        setExportOptions(prev => ({ ...prev, [key]: checked as boolean }))
                      }
                    />
                    <Label htmlFor={`export-${key}`} className="font-normal cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
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
