import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { CheckCircle, WarningCircle } from '@/fakemui/icons'
import type { InstalledPackage } from '@/lib/package-types'
import type { PackageCatalogData } from '@/lib/packages/core/package-catalog'

interface DependenciesTabProps {
  dependencies: string[]
  installedPackages: InstalledPackage[]
  resolveCatalogEntry: (packageId: string) => PackageCatalogData | undefined
}

export function DependenciesTab({
  dependencies,
  installedPackages,
  resolveCatalogEntry,
}: DependenciesTabProps) {
  if (dependencies.length === 0) {
    return <p className="text-sm text-muted-foreground">No dependencies required.</p>
  }

  return (
    <div className="space-y-3">
      {dependencies.map(dependencyId => {
        const catalogEntry = resolveCatalogEntry(dependencyId)
        const isInstalled = installedPackages.some(pkg => pkg.packageId === dependencyId)
        const dependencyName = catalogEntry?.manifest.name ?? dependencyId
        const dependencyDescription =
          catalogEntry?.manifest.description ?? 'Dependency not found in catalog.'

        return (
          <Card key={dependencyId}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {dependencyName}
                  <Badge variant={isInstalled ? 'secondary' : 'outline'}>
                    {isInstalled ? 'Installed' : 'Missing'}
                  </Badge>
                </CardTitle>
                <CardDescription>{dependencyDescription}</CardDescription>
              </div>
              {isInstalled ? (
                <CheckCircle size={20} className="text-green-500" />
              ) : (
                <WarningCircle size={20} className="text-amber-500" />
              )}
            </CardHeader>
            {catalogEntry?.manifest.tags?.length ? (
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {catalogEntry.manifest.tags.map(tag => (
                    <Badge key={`${dependencyId}-${tag}`} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}
