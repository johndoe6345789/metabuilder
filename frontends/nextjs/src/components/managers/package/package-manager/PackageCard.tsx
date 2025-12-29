import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import type { InstalledPackage, PackageManifest } from '@/lib/package-types'
import { Download, Power, Star } from '@phosphor-icons/react'

interface PackageCardProps {
  package: PackageManifest
  isInstalled: boolean
  installedPackage?: InstalledPackage
  onViewDetails: () => void
  onToggle: (packageId: string, enabled: boolean) => void
}

export function PackageCard({
  package: pkg,
  isInstalled,
  installedPackage,
  onViewDetails,
  onToggle,
}: PackageCardProps) {
  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-2xl flex-shrink-0">
            {pkg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{pkg.name}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">{pkg.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">{pkg.category}</Badge>
          {isInstalled && (
            <Badge variant={installedPackage?.enabled ? 'default' : 'outline'}>
              {installedPackage?.enabled ? 'Active' : 'Disabled'}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Download size={14} />
            <span>{pkg.downloadCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={14} weight="fill" className="text-yellow-500" />
            <span>{pkg.rating}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="outline" onClick={onViewDetails} className="flex-1">
          View Details
        </Button>
        {isInstalled && installedPackage && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggle(pkg.id, !installedPackage.enabled)}
            title={installedPackage.enabled ? 'Disable' : 'Enable'}
          >
            <Power size={18} weight={installedPackage.enabled ? 'fill' : 'regular'} />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
