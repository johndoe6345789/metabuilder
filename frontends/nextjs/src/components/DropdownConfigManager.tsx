import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Database } from '@/lib/database'
import { Plus, X, FloppyDisk, Trash, Pencil } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { DropdownConfig } from '@/lib/database'

export function DropdownConfigManager() {
  const [dropdowns, setDropdowns] = useState<DropdownConfig[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingDropdown, setEditingDropdown] = useState<DropdownConfig | null>(null)
  const [dropdownName, setDropdownName] = useState('')
  const [dropdownLabel, setDropdownLabel] = useState('')
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([])
  const [newOptionValue, setNewOptionValue] = useState('')
  const [newOptionLabel, setNewOptionLabel] = useState('')

  useEffect(() => {
    loadDropdowns()
  }, [])

  const loadDropdowns = async () => {
    const configs = await Database.getDropdownConfigs()
    setDropdowns(configs)
  }

  const startEdit = (dropdown?: DropdownConfig) => {
    if (dropdown) {
      setEditingDropdown(dropdown)
      setDropdownName(dropdown.name)
      setDropdownLabel(dropdown.label)
      setOptions(dropdown.options)
    } else {
      setEditingDropdown(null)
      setDropdownName('')
      setDropdownLabel('')
      setOptions([])
    }
    setIsEditing(true)
  }

  const addOption = () => {
    if (newOptionValue && newOptionLabel) {
      setOptions(current => [...current, { value: newOptionValue, label: newOptionLabel }])
      setNewOptionValue('')
      setNewOptionLabel('')
    }
  }

  const removeOption = (index: number) => {
    setOptions(current => current.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!dropdownName || !dropdownLabel || options.length === 0) {
      toast.error('Please fill all fields and add at least one option')
      return
    }

    const newDropdown: DropdownConfig = {
      id: editingDropdown?.id || `dropdown_${Date.now()}`,
      name: dropdownName,
      label: dropdownLabel,
      options,
    }

    if (editingDropdown) {
      await Database.updateDropdownConfig(newDropdown.id, newDropdown)
      toast.success('Dropdown updated successfully')
    } else {
      await Database.addDropdownConfig(newDropdown)
      toast.success('Dropdown created successfully')
    }

    setIsEditing(false)
    loadDropdowns()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this dropdown configuration?')) {
      await Database.deleteDropdownConfig(id)
      toast.success('Dropdown deleted')
      loadDropdowns()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dropdown Configurations</h2>
          <p className="text-sm text-muted-foreground">Manage dynamic dropdown options for properties</p>
        </div>
        <Button onClick={() => startEdit()}>
          <Plus className="mr-2" />
          Create Dropdown
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dropdowns.map(dropdown => (
          <Card key={dropdown.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{dropdown.label}</h3>
                <p className="text-xs text-muted-foreground font-mono">{dropdown.name}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => startEdit(dropdown)}>
                  <Pencil size={16} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(dropdown.id)}>
                  <Trash size={16} />
                </Button>
              </div>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-1">
              {dropdown.options.map((opt, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {opt.label}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {dropdowns.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No dropdown configurations yet. Create one to get started.</p>
        </Card>
      )}

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDropdown ? 'Edit' : 'Create'} Dropdown Configuration</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Dropdown Name (ID)</Label>
              <Input
                placeholder="e.g., status_options"
                value={dropdownName}
                onChange={(e) => setDropdownName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Unique identifier for this dropdown</p>
            </div>

            <div className="space-y-2">
              <Label>Display Label</Label>
              <Input
                placeholder="e.g., Status"
                value={dropdownLabel}
                onChange={(e) => setDropdownLabel(e.target.value)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Options</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Value"
                  value={newOptionValue}
                  onChange={(e) => setNewOptionValue(e.target.value)}
                />
                <Input
                  placeholder="Label"
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                />
                <Button onClick={addOption} type="button">
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            {options.length > 0 && (
              <ScrollArea className="h-[200px] border rounded-lg p-3">
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded bg-muted/50">
                      <div className="flex-1">
                        <span className="font-mono text-sm">{opt.value}</span>
                        <span className="mx-2 text-muted-foreground">→</span>
                        <span className="text-sm">{opt.label}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeOption(i)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <FloppyDisk className="mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
