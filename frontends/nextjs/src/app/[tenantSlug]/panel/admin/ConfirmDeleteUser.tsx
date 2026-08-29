'use client'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@/m3'
import type { UserRecord } from './admin-types'

export interface ConfirmDeleteUserProps {
  user: UserRecord | null
  onCancel: () => void
  onConfirm: () => void
}

/**
 * Asks before removing an account.
 *
 * The delete used to be a local filter on an array, so there was nothing
 * to confirm. Now that it reaches the data layer, it is worth a question.
 */
export function ConfirmDeleteUser({
  user,
  onCancel,
  onConfirm,
}: ConfirmDeleteUserProps) {
  return (
    <Dialog open={user !== null} onClose={onCancel}>
      <DialogTitle>Delete this account?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {user?.username ?? ''} ({user?.email ?? ''}) will be removed from
          the data layer. This cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          Delete account
        </Button>
      </DialogActions>
    </Dialog>
  )
}
