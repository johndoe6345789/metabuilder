'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@/m3'
import type { PageRoute, PageRouteInput } from '@/hooks/usePageRoutes'
import { PageFormFields } from './PageFormFields'
import { usePageForm } from './use-page-form'

interface PageFormDialogProps {
  open: boolean
  page: PageRoute | null
  tenant: string
  onClose: () => void
  onSubmit: (data: PageRouteInput, id?: string) => Promise<void>
}

export function PageFormDialog({
  open,
  page,
  tenant,
  onClose,
  onSubmit,
}: PageFormDialogProps) {
  const {
    form,
    saving,
    error,
    handleChange,
    handleSubmit,
    pathValid,
    titleValid,
  } = usePageForm({ page, tenant, onSubmit, onClose })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{page !== null ? 'Edit Page' : 'New Page'}</DialogTitle>
      <DialogContent dividers>
        <PageFormFields form={form} onChange={handleChange} />
        {error !== null && (
          <Alert severity="error" style={{ marginTop: 12 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            void handleSubmit()
          }}
          disabled={saving || !pathValid || !titleValid}
        >
          {saving ? 'Saving…' : page !== null ? 'Save Changes' : 'Create Page'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
