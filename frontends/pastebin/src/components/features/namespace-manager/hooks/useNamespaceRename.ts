import { useState, useCallback, useRef } from 'react'
import { toast } from '@metabuilder/components/fakemui'
import { Namespace } from '@/lib/types'
import { useTranslation } from '@/hooks/useTranslation'
import { useAppDispatch } from '@/store/hooks'
import { updateNamespace } from '@/store/slices/namespacesSlice'

export function useNamespaceRename(namespaces: Namespace[]) {
  const t = useTranslation()
  const dispatch = useAppDispatch()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  const startEditing = useCallback((namespace: Namespace) => {
    setEditingId(namespace.id)
    setEditingName(namespace.name)
    setTimeout(() => renameInputRef.current?.select(), 0)
  }, [])

  const cancelEditing = useCallback(() => {
    setEditingId(null)
    setEditingName('')
  }, [])

  const commitRename = useCallback(
    async (id: string) => {
      const trimmed = editingName.trim()
      if (!trimmed) { cancelEditing(); return }
      const original = namespaces.find(n => n.id === id)
      if (original && trimmed === original.name) { cancelEditing(); return }
      try {
        await dispatch(
          updateNamespace({ id, name: trimmed }),
        ).unwrap()
      } catch (error) {
        console.error('Failed to rename namespace:', error)
        toast.error(t.namespace.selector.failedToCreate)
      } finally {
        cancelEditing()
      }
    },
    [editingName, namespaces, dispatch, cancelEditing, t],
  )

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
      if (e.key === 'Enter') { e.preventDefault(); commitRename(id) }
      else if (e.key === 'Escape') { e.preventDefault(); cancelEditing() }
    },
    [commitRename, cancelEditing],
  )

  return {
    editingId, editingName, renameInputRef,
    setEditingName,
    startEditing, cancelEditing, commitRename, handleRenameKeyDown,
  }
}
