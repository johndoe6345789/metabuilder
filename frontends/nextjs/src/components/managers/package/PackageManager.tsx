import { useState } from 'react'
import { Badge, Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, ScrollArea, Separator } from '@/components/ui'
import { toast } from 'sonner'
import { installPackage, togglePackageEnabled, uninstallPackage } from '@/lib/api/packages'
import type { PackageCatalogData } from '@/lib/packages/core/package-catalog'
import { ArrowSquareIn, Download, Export, Package, Star, Tag, Trash, User } from '@phosphor-icons/react'
import { PackageImportExport } from './PackageImportExport'
import { PackageFilters } from './package-manager/PackageFilters'
import { PackageTabs } from './package-manager/PackageTabs'
import { usePackages } from './package-manager/usePackages'

interface PackageManagerProps {
  onClose?: () => void
}

export function PackageManager({ onClose }: PackageManagerProps) {
  const {
    filteredPackages,
    installedList,
    availableList,
    installedPackages,
    categories,
    searchQuery,
    categoryFilter,
    sortBy,
    setSearchQuery,
    setCategoryFilter,
    setSortBy,
    loadPackages,
    getCatalogEntry,
  } = usePackages()
  const [selectedPackage, setSelectedPackage] = useState<PackageCatalogData | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [importExportMode, setImportExportMode] = useState<'import' | 'export'>('export')

  const handleInstallPackage = async (packageId: string) => {
    setInstalling(true)
    try {
      const packageEntry = getCatalogEntry(packageId)
      if (!packageEntry) {
        toast.error('Package not found')
        return
      }

      await installPackage(packageId)

      toast.success(`${packageEntry.manifest.name} installed successfully!`)
      await loadPackages()
      setShowDetails(false)
    } catch (error) {
      console.error('Installation error:', error)
      toast.error('Failed to install package')
    } finally {
      setInstalling(false)
    }
  }

  const handleUninstallPackage = async (packageId: string) => {
    try {
      const packageEntry = getCatalogEntry(packageId)
      if (!packageEntry) {
        toast.error('Package not found')
        return
      }

      await uninstallPackage(packageId)

      toast.success(`${packageEntry.manifest.name} uninstalled successfully!`)
      await loadPackages()
      setShowDetails(false)
    } catch (error) {
      console.error('Uninstallation error:', error)
      toast.error('Failed to uninstall package')
    }
  }

  const handleTogglePackage = async (packageId: string, enabled: boolean) => {
    try {
      await togglePackageEnabled(packageId, enabled)
      toast.success(enabled ? 'Package enabled' : 'Package disabled')
      await loadPackages()
    } catch (error) {
      console.error('Toggle error:', error)
      toast.error('Failed to toggle package')
    }
  }

  const openPackageDetails = (packageId: string) => {
    const catalogEntry = getCatalogEntry(packageId)
    if (!catalogEntry) return

    const installedPackage = installedPackages.find(pkg => pkg.packageId === packageId)

    setSelectedPackage({
      ...catalogEntry,
      manifest: { ...catalogEntry.manifest, installed: Boolean(installedPackage) },
    })
    setShowDetails(true)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
            <Package size={24} weight="duotone" className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Package Manager</h2>
            <p className="text-sm text-muted-foreground">Install pre-built applications and features</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setImportExportMode('import')
              setShowImportExport(true)
            }}
          >
            <ArrowSquareIn size={16} className="mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setImportExportMode('export')
              setShowImportExport(true)
            }}
          >
            <Export size={16} className="mr-2" />
            Export
          </Button>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      <PackageFilters
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        sortBy={sortBy}
        categories={categories}
        onSearchChange={setSearchQuery}
        onCategoryChange={setCategoryFilter}
        onSortChange={setSortBy}
      />

      <div className="flex-1 overflow-hidden">
        <PackageTabs
          filteredPackages={filteredPackages}
          installedList={installedList}
          availableList={availableList}
          installedPackages={installedPackages}
          onSelectPackage={openPackageDetails}
          onTogglePackage={handleTogglePackage}
        />
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedPackage && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-3xl flex-shrink-0">
                    {selectedPackage.manifest.icon}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedPackage.manifest.name}</DialogTitle>
                    <DialogDescription className="mt-1">{selectedPackage.manifest.description}</DialogDescription>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant="secondary">{selectedPackage.manifest.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Download size={14} />
                        <span>{selectedPackage.manifest.downloadCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star size={14} weight="fill" className="text-yellow-500" />
                        <span>{selectedPackage.manifest.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Separator className="my-4" />

              <ScrollArea className="flex-1">
                <div className="space-y-6 pr-4">
                  <div>
                    <h4 className="font-semibold mb-2">Author</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User size={16} />
                      <span>{selectedPackage.manifest.author}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Version</h4>
                    <p className="text-sm text-muted-foreground">{selectedPackage.manifest.version}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPackage.manifest.tags.map(tag => (
                        <Badge key={tag} variant="outline">
                          <Tag size={12} className="mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Includes</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="font-medium text-sm">Data Models</div>
                        <div className="text-2xl font-bold text-primary">{selectedPackage.content.schemas.length}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="font-medium text-sm">Pages</div>
                        <div className="text-2xl font-bold text-primary">{selectedPackage.content.pages.length}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="font-medium text-sm">Workflows</div>
                        <div className="text-2xl font-bold text-primary">{selectedPackage.content.workflows.length}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="font-medium text-sm">Scripts</div>
                        <div className="text-2xl font-bold text-primary">{selectedPackage.content.luaScripts.length}</div>
                      </div>
                    </div>
                  </div>

                  {selectedPackage.content.schemas.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Data Models</h4>
                      <div className="space-y-2">
                        {selectedPackage.content.schemas.map(schema => (
                          <div key={schema.name} className="p-3 rounded-lg border">
                            <div className="font-medium">{schema.displayName || schema.name}</div>
                            <div className="text-sm text-muted-foreground">{schema.fields.length} fields</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPackage.content.pages.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Pages</h4>
                      <div className="space-y-2">
                        {selectedPackage.content.pages.map(page => (
                          <div key={page.id} className="p-3 rounded-lg border">
                            <div className="font-medium">{page.title}</div>
                            <div className="text-sm text-muted-foreground font-mono">{page.path}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <DialogFooter className="mt-4">
                {selectedPackage.manifest.installed ? (
                  <Button variant="destructive" onClick={() => handleUninstallPackage(selectedPackage.manifest.id)}>
                    <Trash size={16} className="mr-2" />
                    Uninstall
                  </Button>
                ) : (
                  <Button onClick={() => handleInstallPackage(selectedPackage.manifest.id)} disabled={installing}>
                    <Download size={16} className="mr-2" />
                    {installing ? 'Installing...' : 'Install Package'}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <PackageImportExport
        open={showImportExport}
        onOpenChange={(open) => {
          setShowImportExport(open)
          if (!open) {
            loadPackages()
          }
        }}
        mode={importExportMode}
      />
    </div>
  )
}
