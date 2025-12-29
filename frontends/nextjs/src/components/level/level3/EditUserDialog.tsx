import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { Button, Input } from '@/components/ui'
import type { User } from '@/lib/level-types'

interface EditUserDialogProps {
  open: boolean
  user: User | null
  onClose: (open: boolean) => void
  onChange: (user: User) => void
  onSave: () => void
}

export function EditUserDialog({ open, user, onClose, onChange, onSave }: EditUserDialogProps) {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Username</label>
            <Input
              value={user.username}
              onChange={e => onChange({ ...user, username: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <Input
              type="email"
              value={user.email}
              onChange={e => onChange({ ...user, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Bio</label>
            <Input
              value={user.bio || ''}
              onChange={e => onChange({ ...user, bio: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onClose(false)}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
