import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { NpmPackage } from '@/types/project'
import { Package, Trash } from '@phosphor-icons/react'

interface PackageListSectionProps {
  title: string
  emptyCopy: string
  iconClassName: string
  showDevBadge?: boolean
  packages: NpmPackage[]
  onEditPackage: (pkg: NpmPackage) => void
  onDeletePackage: (packageId: string) => void
}

export function PackageListSection({
  title,
  emptyCopy,
  iconClassName,
  showDevBadge = false,
  packages,
  onEditPackage,
  onDeletePackage,
}: PackageListSectionProps) {
  return (
    <div>
      <h4 className="font-semibold mb-3">{title}</h4>
      <div className="space-y-2">
        {packages.map((pkg) => (
          <Card key={pkg.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Package size={18} className={iconClassName} />
                    <code className="font-semibold">{pkg.name}</code>
                    <Badge variant="secondary">{pkg.version}</Badge>
                    {showDevBadge && (
                      <Badge variant="outline" className="text-xs">
                        dev
                      </Badge>
                    )}
                  </div>
                  {pkg.description && (
                    <p className="text-xs text-muted-foreground mt-1">{pkg.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEditPackage(pkg)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => onDeletePackage(pkg.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {packages.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">{emptyCopy}</p>
          </Card>
        )}
      </div>
    </div>
  )
}
