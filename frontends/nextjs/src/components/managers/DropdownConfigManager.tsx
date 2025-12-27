import { useEffect, useState } from 'react'
import { Button, Card } from '@/components/ui'
import { Database } from '@/lib/database'
import { Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { DropdownConfig } from '@/lib/database'
import { DropdownConfigForm } from './dropdown/DropdownConfigForm'
import { PreviewPane } from './dropdown/PreviewPane'

export function DropdownConfigManager() {
  const [dropdowns, setDropdowns] = useState<DropdownConfig[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingDropdown, setEditingDropdown] = useState<DropdownConfig | null>(null)

  useEffect(() => {
    loadDropdowns()
  }, [])

  const loadDropdowns = async () => {
    const configs = await Database.getDropdownConfigs()
    setDropdowns(configs)
  }

  const openEditor = (dropdown?: DropdownConfig) => {
    setEditingDropdown(dropdown ?? null)
    setIsEditing(true)
  }

  const handleSave = async (config: DropdownConfig, isEdit: boolean) => {
    if (isEdit) {
      await Database.updateDropdownConfig(config.id, config)
      toast.success('Dropdown updated successfully')
    } else {
      await Database.addDropdownConfig(config)
      toast.success('Dropdown created successfully')
    }

    setIsEditing(false)
    await loadDropdowns()
  }

  const handleDelete = async (id: string) => {
    await Database.deleteDropdownConfig(id)
    toast.success('Dropdown deleted')
    await loadDropdowns()
  }

  const handleDialogChange = (open: boolean) => {
    setIsEditing(open)
    if (!open) {
      setEditingDropdown(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dropdown Configurations</h2>
          <p className="text-sm text-muted-foreground">Manage dynamic dropdown options for properties</p>
        </div>
        <Button onClick={() => openEditor()}>
          <Plus className="mr-2" />
          Create Dropdown
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dropdowns.map(dropdown => (
          <PreviewPane
            key={dropdown.id}
            dropdown={dropdown}
            onEdit={openEditor}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {dropdowns.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No dropdown configurations yet. Create one to get started.</p>
        </Card>
      )}

      <DropdownConfigForm
        open={isEditing}
        editingDropdown={editingDropdown}
        onOpenChange={handleDialogChange}
        onSave={handleSave}
      />
    </div>
  )
}
