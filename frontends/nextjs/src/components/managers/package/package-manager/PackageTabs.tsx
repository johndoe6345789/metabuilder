import { Package } from '@phosphor-icons/react'

import { ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import type { InstalledPackage, PackageManifest } from '@/lib/package-types'

import { PackageCard } from './PackageCard'

interface PackageTabsProps {
  filteredPackages: PackageManifest[]
  installedList: PackageManifest[]
  availableList: PackageManifest[]
  installedPackages: InstalledPackage[]
  onSelectPackage: (packageId: string) => void
  onTogglePackage: (packageId: string, enabled: boolean) => Promise<void>
}

export function PackageTabs({
  filteredPackages,
  installedList,
  availableList,
  installedPackages,
  onSelectPackage,
  onTogglePackage,
}: PackageTabsProps) {
  const renderPackageCards = (
    packages: PackageManifest[],
    isInstalled: (pkg: PackageManifest) => boolean
  ) => (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {packages.map(pkg => (
        <PackageCard
          key={pkg.id}
          package={pkg}
          isInstalled={isInstalled(pkg)}
          installedPackage={installedPackages.find(ip => ip.packageId === pkg.id)}
          onViewDetails={() => onSelectPackage(pkg.id)}
          onToggle={onTogglePackage}
        />
      ))}
    </div>
  )

  return (
    <Tabs defaultValue="all" className="h-full flex flex-col">
      <div className="px-6 pt-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Packages</TabsTrigger>
          <TabsTrigger value="installed">Installed ({installedList.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availableList.length})</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="all" className="flex-1 m-0">
        <ScrollArea className="h-full">
          {renderPackageCards(filteredPackages, pkg => pkg.installed)}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="installed" className="flex-1 m-0">
        <ScrollArea className="h-full">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {installedList.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Package size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No packages installed yet</p>
              </div>
            ) : (
              installedList.map(pkg => (
                <PackageCard
                  key={pkg.id}
                  package={pkg}
                  isInstalled
                  installedPackage={installedPackages.find(ip => ip.packageId === pkg.id)}
                  onViewDetails={() => onSelectPackage(pkg.id)}
                  onToggle={onTogglePackage}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="available" className="flex-1 m-0">
        <ScrollArea className="h-full">{renderPackageCards(availableList, () => false)}</ScrollArea>
      </TabsContent>
    </Tabs>
  )
}
