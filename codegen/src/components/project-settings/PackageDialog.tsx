import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { NpmPackage } from '@/types/project'
import projectSettingsCopy from '@/data/project-settings.json'

interface PackageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingPackage: NpmPackage | null
  setEditingPackage: (pkg: NpmPackage | null) => void
  onSave: () => void
}

export function PackageDialog({
  open,
  onOpenChange,
  editingPackage,
  setEditingPackage,
  onSave,
}: PackageDialogProps) {
  const copy = projectSettingsCopy.packages.dialog
  const isEditing = Boolean(editingPackage?.name)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? copy.title.edit : copy.title.add}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        {editingPackage && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="package-name">{copy.fields.name.label}</Label>
              <Input
                id="package-name"
                value={editingPackage.name}
                onChange={(e) =>
                  setEditingPackage({ ...editingPackage, name: e.target.value })
                }
                placeholder={copy.fields.name.placeholder}
              />
            </div>
            <div>
              <Label htmlFor="package-version">{copy.fields.version.label}</Label>
              <Input
                id="package-version"
                value={editingPackage.version}
                onChange={(e) =>
                  setEditingPackage({ ...editingPackage, version: e.target.value })
                }
                placeholder={copy.fields.version.placeholder}
              />
            </div>
            <div>
              <Label htmlFor="package-description">{copy.fields.description.label}</Label>
              <Input
                id="package-description"
                value={editingPackage.description || ''}
                onChange={(e) =>
                  setEditingPackage({ ...editingPackage, description: e.target.value })
                }
                placeholder={copy.fields.description.placeholder}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="package-dev">{copy.fields.devDependency.label}</Label>
              <Switch
                id="package-dev"
                checked={editingPackage.isDev}
                onCheckedChange={(checked) =>
                  setEditingPackage({ ...editingPackage, isDev: checked })
                }
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Package</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
