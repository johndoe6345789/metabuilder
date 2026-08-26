'use client'

import { useCallback, useState } from 'react'
import type { PackageManifest } from '@/lib/packages/core/package-types'

export interface EditDraft {
  name: string
  description: string
  category: PackageManifest['category']
  icon: string
}

/** View state for the package manager (no state in the component itself).
 * workflowIds/pageConfigIds/themeId aren't part of this draft -- the
 * "Package contents" section writes straight through to the Redux draft via
 * updateContents() on every add/remove/reorder, rather than staging those
 * too and needing a second Cancel path for them. */
export function usePackageManagerUi() {
  const [newName, setNewName] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<EditDraft>({
    name: '',
    description: '',
    category: 'other',
    icon: 'deployed_code',
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
