import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Trash } from '@phosphor-icons/react'
import { Namespace } from '@/lib/types'

interface DeleteNamespaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  namespace: Namespace | null
  onDeleteNamespace: () => void
  loading: boolean
  showTrigger?: boolean
  onOpenDialog?: () => void
}

export function DeleteNamespaceDialog({
  open,
  onOpenChange,
  namespace,
  onDeleteNamespace,
  loading,
  showTrigger = false,
  onOpenDialog,
}: DeleteNamespaceDialogProps) {
  return (
    <>
      {showTrigger && (
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenDialog}
          data-testid="delete-namespace-trigger"
          aria-label="Delete namespace"
        >
          <Trash weight="bold" aria-hidden="true" />
        </Button>
      )}

      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent data-testid="delete-namespace-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Namespace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{namespace?.name}"? All snippets in this namespace will be moved to the default namespace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete-namespace-cancel-btn">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteNamespace}
              disabled={loading}
              data-testid="delete-namespace-confirm-btn"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
