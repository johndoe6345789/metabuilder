"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from '@phosphor-icons/react'

interface CreateNamespaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  namespaceName: string
  onNamespaceNameChange: (name: string) => void
  onCreateNamespace: () => void
  loading: boolean
}

export function CreateNamespaceDialog({
  open,
  onOpenChange,
  namespaceName,
  onNamespaceNameChange,
  onCreateNamespace,
  loading,
}: CreateNamespaceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        className="px-2 py-1 rounded border border-input hover:bg-accent hover:text-accent-foreground"
        data-testid="create-namespace-trigger"
        aria-label="Create new namespace"
      >
        <Plus weight="bold" aria-hidden="true" />
      </DialogTrigger>
      <DialogContent data-testid="create-namespace-dialog">
        <DialogHeader>
          <DialogTitle>Create Namespace</DialogTitle>
          <DialogDescription>
            Create a new namespace to organize your snippets
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Namespace name"
            value={namespaceName}
            onChange={(e) => onNamespaceNameChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onCreateNamespace()}
            data-testid="namespace-name-input"
            aria-label="Namespace name"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="create-namespace-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            onClick={onCreateNamespace}
            disabled={loading}
            data-testid="create-namespace-save-btn"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
