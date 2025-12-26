import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'

interface NewItemDialogProps {
  open: boolean
  newItemName: string
  newItemType: 'file' | 'folder'
  onNameChange: (value: string) => void
  onTypeChange: (value: 'file' | 'folder') => void
  onClose: () => void
  onCreate: () => void
}

export function NewItemDialog({
  open,
  newItemName,
  newItemType,
  onNameChange,
  onTypeChange,
  onClose,
  onCreate,
}: NewItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New {newItemType === 'file' ? 'File' : 'Folder'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-type">Type</Label>
            <Select value={newItemType} onValueChange={(value: 'file' | 'folder') => onTypeChange(value)}>
              <SelectTrigger id="file-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="folder">Folder</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="file-name">Name</Label>
            <Input
              id="file-name"
              placeholder={newItemType === 'file' ? 'example.tsx' : 'folder-name'}
              value={newItemName}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCreate()
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
