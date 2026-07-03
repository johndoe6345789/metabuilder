'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from '@/m3'
import type { PageRoute } from '@/hooks/usePageRoutes'

interface DeletePageDialogProps {
  open: boolean
  page: PageRoute | null
  onClose: () => void
  onConfirm: (id: string) => Promise<void>
}

export function DeletePageDialog({
  open,
  page,
  onClose,
  onConfirm,
}: DeletePageDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (page === null) return
    setDeleting(true)
    setError(null)
    try {
      await onConfirm(page.id)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Page</DialogTitle>
      <DialogContent>
        {page !== null && (
          <>
            <Typography variant="body2" gutterBottom>
              Are you sure you want to delete{' '}
              <strong>{page.title}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Path: <code>{page.path}</code>
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              style={{ display: 'block', marginTop: 8 }}
            >
              This action cannot be undone.
            </Typography>
          </>
        )}
        {error !== null && (
          <Alert severity="error" style={{ marginTop: 12 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => void handleConfirm()}
          disabled={deleting}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
