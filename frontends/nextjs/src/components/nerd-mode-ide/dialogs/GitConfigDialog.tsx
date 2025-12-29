import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import type { GitConfig } from './types'

interface GitConfigDialogProps {
  open: boolean
  gitConfig: GitConfig | null
  onUpdate: (updates: Partial<GitConfig>) => void
  onClose: () => void
  onSave: () => void
}

export function GitConfigDialog({
  open,
  gitConfig,
  onUpdate,
  onClose,
  onSave,
}: GitConfigDialogProps) {
  return (
    <Dialog open={open} onOpenChange={nextOpen => (!nextOpen ? onClose() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Git Integration</DialogTitle>
          <DialogDescription>Connect to GitHub or GitLab to sync your code</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="git-provider">Provider</Label>
            <Select
              value={gitConfig?.provider || 'github'}
              onValueChange={(value: 'github' | 'gitlab') => onUpdate({ provider: value })}
            >
              <SelectTrigger id="git-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="gitlab">GitLab</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="git-repo">Repository URL</Label>
            <Input
              id="git-repo"
              placeholder="https://github.com/user/repo"
              value={gitConfig?.repoUrl || ''}
              onChange={e => onUpdate({ repoUrl: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="git-branch">Branch</Label>
            <Input
              id="git-branch"
              placeholder="main"
              value={gitConfig?.branch || 'main'}
              onChange={e => onUpdate({ branch: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="git-token">Access Token</Label>
            <Input
              id="git-token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxx"
              value={gitConfig?.token || ''}
              onChange={e => onUpdate({ token: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
