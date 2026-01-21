import { NpmPackage, NpmSettings } from '@/types/project'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import projectSettingsCopy from '@/data/project-settings.json'
import { Plus } from '@phosphor-icons/react'
import { PackageListSection } from '@/components/project-settings/PackageListSection'

interface PackagesTabProps {
  npmSettings: NpmSettings
  onNpmSettingsChange: (settings: NpmSettings | ((current: NpmSettings) => NpmSettings)) => void
  onAddPackage: () => void
  onEditPackage: (pkg: NpmPackage) => void
  onDeletePackage: (packageId: string) => void
}

export function PackagesTab({
  npmSettings,
  onNpmSettingsChange,
  onAddPackage,
  onEditPackage,
  onDeletePackage,
}: PackagesTabProps) {
  const copy = projectSettingsCopy.packages
  const dependencies = npmSettings.packages.filter((pkg) => !pkg.isDev)
  const devDependencies = npmSettings.packages.filter((pkg) => pkg.isDev)

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{copy.title}</h3>
          <p className="text-sm text-muted-foreground">{copy.description}</p>
        </div>
        <Button onClick={onAddPackage}>
          <Plus size={16} className="mr-2" />
          {copy.dialog.title.add}
        </Button>
      </div>

      <div className="mb-6">
        <Label htmlFor="package-manager">{copy.packageManager.label}</Label>
        <Select
          value={npmSettings.packageManager}
          onValueChange={(value: any) =>
            onNpmSettingsChange((current) => ({
              ...current,
              packageManager: value,
            }))
          }
        >
          <SelectTrigger id="package-manager" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="npm">npm</SelectItem>
            <SelectItem value="yarn">yarn</SelectItem>
            <SelectItem value="pnpm">pnpm</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <PackageListSection
          title={copy.dependencies.title}
          emptyCopy={copy.dependencies.empty}
          iconClassName="text-primary"
          packages={dependencies}
          onEditPackage={onEditPackage}
          onDeletePackage={onDeletePackage}
        />
        <PackageListSection
          title={copy.devDependencies.title}
          emptyCopy={copy.devDependencies.empty}
          iconClassName="text-muted-foreground"
          showDevBadge
          packages={devDependencies}
          onEditPackage={onEditPackage}
          onDeletePackage={onDeletePackage}
        />
      </div>
    </div>
  )
}
