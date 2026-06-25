import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Database } from '@/lib/database'
import { exportPackageAsZip, importPackageFromZip, downloadZip, exportDatabaseSnapshot } from '@/lib/package-export'
import type { PackageManifest, PackageContent } from '@/lib/package-types'
import type { ExportPackageOptions } from '@/lib/package-export'
import { 
  Export, 
  ArrowSquareIn, 
  FileArchive, 
  FileArrowDown,
  FileArrowUp,
  Package,
  CloudArrowDown,
  Database as DatabaseIcon,
  CheckCircle,
  Warning,
  Image as ImageIcon,
  FilmStrip,
  MusicNote,
  FileText
} from '@phosphor-icons/react'

interface PackageImportExportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'export' | 'import'
}

export function PackageImportExport({ open, onOpenChange, mode }: PackageImportExportProps) {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportPackageOptions>({
    includeAssets: true,
    includeSchemas: true,
    includePages: true,
    includeWorkflows: true,
    includeLuaScripts: true,
    includeComponentHierarchy: true,
    includeComponentConfigs: true,
    includeCssClasses: true,
    includeDropdownConfigs: true,
    includeSeedData: true,
  })
  const [manifest, setManifest] = useState<Partial<PackageManifest>>({
    name: '',
    version: '1.0.0',
    description: '',
    author: '',
    category: 'other',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    if (!manifest.name) {
      toast.error('Please provide a package name')
      return
    }

    setExporting(true)
    try {
      const schemas = await Database.getSchemas()
      const pages = await Database.getPages()
      const workflows = await Database.getWorkflows()
      const luaScripts = await Database.getLuaScripts()
      const componentHierarchy = await Database.getComponentHierarchy()
      const componentConfigs = await Database.getComponentConfigs()
      const cssClasses = await Database.getCssClasses()
      const dropdownConfigs = await Database.getDropdownConfigs()

      const fullManifest: PackageManifest = {
        id: `pkg_${Date.now()}`,
        name: manifest.name!,
        version: manifest.version || '1.0.0',
        description: manifest.description || '',
        author: manifest.author || 'Anonymous',
        category: manifest.category as any || 'other',
        icon: '📦',
        screenshots: [],
        tags: manifest.tags || [],
        dependencies: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        downloadCount: 0,
        rating: 0,
        installed: false,
      }

      const content: PackageContent = {
        schemas: exportOptions.includeSchemas ? schemas : [],
        pages: exportOptions.includePages ? pages : [],
        workflows: exportOptions.includeWorkflows ? workflows : [],
        luaScripts: exportOptions.includeLuaScripts ? luaScripts : [],
        componentHierarchy: exportOptions.includeComponentHierarchy ? componentHierarchy : {},
        componentConfigs: exportOptions.includeComponentConfigs ? componentConfigs : {},
        cssClasses: exportOptions.includeCssClasses ? cssClasses : undefined,
        dropdownConfigs: exportOptions.includeDropdownConfigs ? dropdownConfigs : undefined,
      }

      const blob = await exportPackageAsZip(fullManifest, content, [], exportOptions)
      const fileName = `${manifest.name.toLowerCase().replace(/\s+/g, '-')}-${manifest.version}.zip`
      downloadZip(blob, fileName)

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
      const schemas = await Database.getSchemas()
      const pages = await Database.getPages()
      const workflows = await Database.getWorkflows()
      const luaScripts = await Database.getLuaScripts()
      const componentHierarchy = await Database.getComponentHierarchy()
      const componentConfigs = await Database.getComponentConfigs()
      const cssClasses = await Database.getCssClasses()
      const dropdownConfigs = await Database.getDropdownConfigs()

      const blob = await exportDatabaseSnapshot(
        schemas,
        pages,
        workflows,
        luaScripts,
        componentHierarchy,
        componentConfigs,
        cssClasses,
        dropdownConfigs
      )

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      downloadZip(blob, `database-snapshot-${timestamp}.zip`)

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
      const { manifest: importedManifest, content, assets } = await importPackageFromZip(file)

      const currentSchemas = await Database.getSchemas()
      const currentPages = await Database.getPages()
      const currentWorkflows = await Database.getWorkflows()
      const currentLuaScripts = await Database.getLuaScripts()
      const currentHierarchy = await Database.getComponentHierarchy()
      const currentConfigs = await Database.getComponentConfigs()

      const newSchemas = [...currentSchemas, ...content.schemas]
      const newPages = [...currentPages, ...content.pages]
      const newWorkflows = [...currentWorkflows, ...content.workflows]
      const newLuaScripts = [...currentLuaScripts, ...content.luaScripts]
      const newHierarchy = { ...currentHierarchy, ...content.componentHierarchy }
      const newConfigs = { ...currentConfigs, ...content.componentConfigs }

      await Database.setSchemas(newSchemas)
      await Database.setPages(newPages)
      await Database.setWorkflows(newWorkflows)
      await Database.setLuaScripts(newLuaScripts)
      await Database.setComponentHierarchy(newHierarchy)
      await Database.setComponentConfigs(newConfigs)

      if (content.cssClasses) {
        const currentCssClasses = await Database.getCssClasses()
        await Database.setCssClasses([...currentCssClasses, ...content.cssClasses])
      }

      if (content.dropdownConfigs) {
        const currentDropdowns = await Database.getDropdownConfigs()
        await Database.setDropdownConfigs([...currentDropdowns, ...content.dropdownConfigs])
      }

      if (content.seedData) {
        await Database.setPackageData(importedManifest.id, content.seedData)
      }

      const installedPackage = {
        packageId: importedManifest.id,
        installedAt: Date.now(),
        version: importedManifest.version,
        enabled: true,
      }

      await Database.installPackage(installedPackage)

      toast.success(`Package "${importedManifest.name}" imported successfully!`)
      toast.info(`Imported: ${content.schemas.length} schemas, ${content.pages.length} pages, ${content.workflows.length} workflows, ${assets.length} assets`)
      
      onOpenChange(false)
    } catch (error) {
      console.error('Import error:', error)
      toast.error(`Failed to import package: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setImporting(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.zip')) {
        toast.error('Please select a .zip file')
        return
      }
      handleImport(file)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !manifest.tags?.includes(tagInput.trim())) {
      setManifest(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setManifest(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag)
    }))
  }

  if (mode === 'import') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <ArrowSquareIn size={24} weight="duotone" className="text-white" />
              </div>
              <div>
                <DialogTitle>Import Package</DialogTitle>
                <DialogDescription>Import a package from a ZIP file</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Package File</CardTitle>
                <CardDescription>Choose a .zip file containing a MetaBuilder package</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div 
                    className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileArrowUp size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium mb-1">Click to select a package file</p>
                    <p className="text-sm text-muted-foreground">Supports .zip files only</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".zip"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {importing && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Importing package...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's Included in Packages?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>Data schemas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>Page configurations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>Workflows</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>Lua scripts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>Component hierarchies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>CSS configurations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>Assets (images, etc.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>Seed data</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
              <Warning size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Import Warning</p>
                <p className="text-yellow-800 dark:text-yellow-200">Imported packages will be merged with existing data. Make sure to back up your database before importing.</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
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
                onClick={handleExportSnapshot}
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
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag}>Add</Button>
                </div>
                {manifest.tags && manifest.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {manifest.tags.map(tag => (
                      <div key={tag} className="px-2 py-1 bg-secondary rounded-md text-sm flex items-center gap-2">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
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
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="export-schemas"
                    checked={exportOptions.includeSchemas}
                    onCheckedChange={checked => 
                      setExportOptions(prev => ({ ...prev, includeSchemas: checked as boolean }))
                    }
                  />
                  <Label htmlFor="export-schemas" className="font-normal cursor-pointer">
                    Include data schemas
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="export-pages"
                    checked={exportOptions.includePages}
                    onCheckedChange={checked => 
                      setExportOptions(prev => ({ ...prev, includePages: checked as boolean }))
                    }
                  />
                  <Label htmlFor="export-pages" className="font-normal cursor-pointer">
                    Include page configurations
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="export-workflows"
                    checked={exportOptions.includeWorkflows}
                    onCheckedChange={checked => 
                      setExportOptions(prev => ({ ...prev, includeWorkflows: checked as boolean }))
                    }
                  />
                  <Label htmlFor="export-workflows" className="font-normal cursor-pointer">
                    Include workflows
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="export-lua"
                    checked={exportOptions.includeLuaScripts}
                    onCheckedChange={checked => 
                      setExportOptions(prev => ({ ...prev, includeLuaScripts: checked as boolean }))
                    }
                  />
                  <Label htmlFor="export-lua" className="font-normal cursor-pointer">
                    Include Lua scripts
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="export-components"
                    checked={exportOptions.includeComponentHierarchy}
                    onCheckedChange={checked => 
                      setExportOptions(prev => ({ ...prev, includeComponentHierarchy: checked as boolean }))
                    }
                  />
                  <Label htmlFor="export-components" className="font-normal cursor-pointer">
                    Include component hierarchies
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="export-configs"
                    checked={exportOptions.includeComponentConfigs}
                    onCheckedChange={checked => 
                      setExportOptions(prev => ({ ...prev, includeComponentConfigs: checked as boolean }))
                    }
                  />
                  <Label htmlFor="export-configs" className="font-normal cursor-pointer">
                    Include component configurations
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="export-css"
                    checked={exportOptions.includeCssClasses}
                    onCheckedChange={checked => 
                      setExportOptions(prev => ({ ...prev, includeCssClasses: checked as boolean }))
                    }
                  />
                  <Label htmlFor="export-css" className="font-normal cursor-pointer">
                    Include CSS classes
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="export-dropdowns"
                    checked={exportOptions.includeDropdownConfigs}
                    onCheckedChange={checked => 
                      setExportOptions(prev => ({ ...prev, includeDropdownConfigs: checked as boolean }))
                    }
                  />
                  <Label htmlFor="export-dropdowns" className="font-normal cursor-pointer">
                    Include dropdown configurations
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="export-seed"
                    checked={exportOptions.includeSeedData}
                    onCheckedChange={checked => 
                      setExportOptions(prev => ({ ...prev, includeSeedData: checked as boolean }))
                    }
                  />
                  <Label htmlFor="export-seed" className="font-normal cursor-pointer">
                    Include seed data
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="export-assets"
                    checked={exportOptions.includeAssets}
                    onCheckedChange={checked => 
                      setExportOptions(prev => ({ ...prev, includeAssets: checked as boolean }))
                    }
                  />
                  <Label htmlFor="export-assets" className="font-normal cursor-pointer">
                    Include assets (images, videos, audio, documents)
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting || !manifest.name}>
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
}
