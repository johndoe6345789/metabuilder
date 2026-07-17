'use client'

import { useCallback, useState } from 'react'

export interface EditDraft {
  name: string
  version: string
  description: string
}

/** View state for the package manager (no state in the component itself). */
export function usePackageManagerUi() {
  const [newName, setNewName] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<EditDraft>({
    name: '',
    version: '',
    description: '',
  })
  const [flash, setFlash] = useState<string | null>(null)

  const beginEdit = useCallback((id: string, d: EditDraft) => {
    setEditingId(id)
    setDraft(d)
  }, [])
  const cancelEdit = useCallback(() => setEditingId(null), [])
  const patchDraft = useCallback((p: Partial<EditDraft>) => {
    setDraft(d => ({ ...d, ...p }))
  }, [])

  return {
    newName,
    setNewName,
    showArchived,
    setShowArchived,
    editingId,
    draft,
    beginEdit,
    cancelEdit,
    patchDraft,
    flash,
    setFlash,
  }
}
