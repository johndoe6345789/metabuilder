import { useState } from 'react'

/** Tracks the in-flight/error state around a single confirm-then-delete
 *  action, so the dialog only owns what to render. Returns whether the
 *  delete succeeded, so the caller can close itself only on success. */
export function useDeleteConfirm(onConfirm: () => Promise<void>) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirm = async (): Promise<boolean> => {
    setDeleting(true)
    setError(null)
    try {
      await onConfirm()
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
      return false
    } finally {
      setDeleting(false)
    }
  }

  return { deleting, error, confirm }
}
