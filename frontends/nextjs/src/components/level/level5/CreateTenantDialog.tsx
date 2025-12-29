import { Button, Input, Label } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'

interface CreateTenantDialogProps {
  open: boolean
  newTenantName: string
  onChangeTenantName: (value: string) => void
  onClose: (open: boolean) => void
  onCreate: () => void
}

export function CreateTenantDialog({
  open,
  newTenantName,
  onChangeTenantName,
  onClose,
  onCreate,
}: CreateTenantDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Create New Tenant</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new tenant instance with its own homepage configuration
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="tenant-name">Tenant Name</Label>
            <Input
              id="tenant-name"
              value={newTenantName}
              onChange={e => onChangeTenantName(e.target.value)}
              placeholder="Enter tenant name"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button onClick={onCreate} className="bg-purple-600 hover:bg-purple-700">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
