import {
  Button, Dialog, DialogHeader, DialogTitle,
  DialogContent, DialogActions,
} from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'

interface SnippetDeleteDialogProps {
  open: boolean
  snippetTitle: string
  onCancel: () => void
  onConfirm: () => void
}

export function SnippetDeleteDialog({
  open,
  snippetTitle,
  onCancel,
  onConfirm,
}: SnippetDeleteDialogProps) {
  const t = useTranslation()
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogHeader>
        <DialogTitle>
          {t.snippetCard.deleteDialog.title}
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <p>
          {t.snippetCard.deleteDialog.body.replace(
            '{title}',
            snippetTitle,
          )}
        </p>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onCancel}>
          {t.common.cancel}
        </Button>
        <Button
          onClick={onConfirm}
          data-testid="confirm-delete-snippet-btn"
          variant="outlined"
        >
          {t.common.delete}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
