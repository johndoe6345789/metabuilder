import { useState } from 'react'
import { Button } from '@/components/ui'
import type { PackageCatalogData } from '@/lib/packages/core/package-catalog'
import { ArrowSquareIn, Export, Package } from '@phosphor-icons/react'
import { PackageDetailsDialog } from './PackageDetailsDialog'
import { PackageImportExport } from './PackageImportExport'
import { PackageFilters } from './package-manager/PackageFilters'
import { PackageTabs } from './package-manager/PackageTabs'
import { usePackageActions } from './package-manager/usePackageActions'
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
  const [showImportExport, setShowImportExport] = useState(false)
  const [importExportMode, setImportExportMode] = useState<'import' | 'export'>('export')
  const { installing, handleInstallPackage, handleUninstallPackage, handleTogglePackage } =
    usePackageActions({
      loadPackages,
      getCatalogEntry,
    })

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
            <p className="text-sm text-muted-foreground">
              Install pre-built applications and features
            </p>
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

      <PackageDetailsDialog
        open={showDetails}
        onOpenChange={setShowDetails}
        selectedPackage={selectedPackage}
        installing={installing}
        onInstall={packageId => handleInstallPackage(packageId, () => setShowDetails(false))}
        onUninstall={packageId => handleUninstallPackage(packageId, () => setShowDetails(false))}
        installedPackages={installedPackages}
        getCatalogEntry={getCatalogEntry}
      />

      <PackageImportExport
        open={showImportExport}
        onOpenChange={open => {
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
