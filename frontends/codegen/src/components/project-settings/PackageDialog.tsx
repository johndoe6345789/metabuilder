import { useState } from 'react'
import { Dialog } from '@metabuilder/fakemui/feedback'
import { DialogContent, DialogHeader, DialogTitle, DialogContentText, DialogActions } from '@metabuilder/fakemui/utils'
import { Button } from '@metabuilder/fakemui/inputs'
import { Input } from '@metabuilder/fakemui/inputs'
import { Label } from '@metabuilder/fakemui/atoms'
import { Switch } from '@metabuilder/fakemui/inputs'
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
    <Dialog open={open} onClose={() => onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? copy.title.edit : copy.title.add}</DialogTitle>
          <DialogContentText>{copy.description}</DialogContentText>
        </DialogHeader>
        {editingPackage && (
          <div>
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
            <div>
              <Label htmlFor="package-dev">{copy.fields.devDependency.label}</Label>
              <Switch
                id="package-dev"
                checked={editingPackage.isDev}
                onChange={(e) =>
                  setEditingPackage({ ...editingPackage, isDev: e.target.checked })
                }
              />
            </div>
          </div>
        )}
        <DialogActions>
          <Button variant="outlined" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="filled" onClick={onSave}>Save Package</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
