import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Label, ScrollArea, Separator } from '@/components/ui'
import { FloppyDisk, Plus, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { DropdownConfig } from '@/lib/database'

interface DropdownConfigFormProps {
  open: boolean
  editingDropdown: DropdownConfig | null
  onOpenChange: (open: boolean) => void
  onSave: (config: DropdownConfig, isEdit: boolean) => Promise<void> | void
}

const getDefaultOptions = (dropdown?: DropdownConfig | null) => dropdown?.options ?? []

const buildDropdownConfig = (
  dropdown: DropdownConfig | null,
  name: string,
  label: string,
  options: Array<{ value: string; label: string }>
): DropdownConfig => ({
  id: dropdown?.id ?? `dropdown_${Date.now()}`,
  name: name.trim(),
  label: label.trim(),
  options,
})

export function DropdownConfigForm({ open, editingDropdown, onOpenChange, onSave }: DropdownConfigFormProps) {
  const [dropdownName, setDropdownName] = useState('')
  const [dropdownLabel, setDropdownLabel] = useState('')
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([])
  const [newOptionValue, setNewOptionValue] = useState('')
  const [newOptionLabel, setNewOptionLabel] = useState('')

  const isEditMode = useMemo(() => Boolean(editingDropdown), [editingDropdown])

  useEffect(() => {
    if (open) {
      setDropdownName(editingDropdown?.name ?? '')
      setDropdownLabel(editingDropdown?.label ?? '')
      setOptions(getDefaultOptions(editingDropdown))
    } else {
      setDropdownName('')
      setDropdownLabel('')
      setOptions([])
      setNewOptionValue('')
      setNewOptionLabel('')
    }
  }, [open, editingDropdown])

  const addOption = () => {
    if (!newOptionValue.trim() || !newOptionLabel.trim()) {
      toast.error('Please provide both a value and label for the option')
      return
    }

    const duplicate = options.some(
      (opt) => opt.value.toLowerCase() === newOptionValue.trim().toLowerCase()
    )

    if (duplicate) {
      toast.error('An option with this value already exists')
      return
    }

    setOptions((current) => [
      ...current,
      { value: newOptionValue.trim(), label: newOptionLabel.trim() },
    ])
    setNewOptionValue('')
    setNewOptionLabel('')
  }

  const removeOption = (index: number) => {
    setOptions((current) => current.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!dropdownName.trim() || !dropdownLabel.trim() || options.length === 0) {
      toast.error('Please fill all fields and add at least one option')
      return
    }

    const config = buildDropdownConfig(editingDropdown, dropdownName, dropdownLabel, options)
    await onSave(config, isEditMode)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit' : 'Create'} Dropdown Configuration</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dropdownName">Dropdown Name (ID)</Label>
            <Input
              id="dropdownName"
              placeholder="e.g., status_options"
              value={dropdownName}
              onChange={(e) => setDropdownName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Unique identifier for this dropdown</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dropdownLabel">Display Label</Label>
            <Input
              id="dropdownLabel"
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

        {options.length === 0 && (
          <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
            <Badge variant="outline">Tip</Badge>
            Add at least one option to save this dropdown configuration.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <FloppyDisk className="mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
