import { Badge } from '@metabuilder/fakemui/data-display'
import { Button } from '@metabuilder/fakemui/inputs'
import { Card, CardContent } from '@metabuilder/fakemui/surfaces'
import { NpmPackage } from '@/types/project'
import { Package, Trash } from '@metabuilder/fakemui/icons'

interface PackageListSectionProps {
  title: string
  emptyCopy: string
  showDevBadge?: boolean
  packages: NpmPackage[]
  onEditPackage: (pkg: NpmPackage) => void
  onDeletePackage: (packageId: string) => void
}

export function PackageListSection({
  title,
  emptyCopy,
  showDevBadge = false,
  packages,
  onEditPackage,
  onDeletePackage,
}: PackageListSectionProps) {
  return (
    <div className="pkg-section">
      <h4 className="pkg-section__title">{title}</h4>
      <div className="pkg-section__list">
        {packages.map((pkg) => (
          <Card key={pkg.id}>
            <CardContent>
              <div className="pkg-section__row">
                <div className="pkg-section__info">
                  <div className="pkg-section__name-row">
                    <Package size={16} />
                    <code>{pkg.name}</code>
                    <Badge variant="tonal">{pkg.version}</Badge>
                    {showDevBadge && <Badge variant="outlined">dev</Badge>}
                  </div>
                  {pkg.description && <p className="pkg-section__desc">{pkg.description}</p>}
                </div>
                <div className="pkg-section__actions">
                  <Button size="small" variant="outlined" onClick={() => onEditPackage(pkg)}>
                    Edit
                  </Button>
                  <Button size="small" variant="text" onClick={() => onDeletePackage(pkg.id)}>
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {packages.length === 0 && (
          <p className="pkg-section__empty">{emptyCopy}</p>
        )}
      </div>
    </div>
  )
}
