import { useState } from 'react'
import { toast } from '@metabuilder/components/fakemui'
import { Namespace } from '@/lib/types'
import { getSnippetsByNamespace, bulkMoveSnippets } from '@/lib/db'
import { useTranslation } from '@/hooks/useTranslation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  createNamespace,
  deleteNamespace,
} from '@/store/slices/namespacesSlice'
import { useNamespaceRename } from './useNamespaceRename'

interface UseNamespaceSelectorProps {
  selectedNamespaceId: string | null
  onNamespaceChange: (namespaceId: string) => void
}

export function useNamespaceSelector({
  selectedNamespaceId,
  onNamespaceChange,
}: UseNamespaceSelectorProps) {
  const t = useTranslation()
  const dispatch = useAppDispatch()
  const namespaces = useAppSelector(state => state.namespaces.items)

  const [newNamespaceName, setNewNamespaceName] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [namespaceToDelete, setNamespaceToDelete] = useState<Namespace | null>(
    null,
  )
  const [loading, setLoading] = useState(false)
  const rename = useNamespaceRename(namespaces)

  const handleCreateNamespace = async () => {
    if (!newNamespaceName.trim()) {
      toast.error(t.namespace.selector.enterName)
      return
    }
    setLoading(true)
    try {
      await dispatch(createNamespace(newNamespaceName.trim())).unwrap()
      setNewNamespaceName('')
      setCreateDialogOpen(false)
      toast.success(t.namespace.selector.created)
    } catch (error) {
      console.error('Failed to create namespace:', error)
      toast.error(t.namespace.selector.failedToCreate)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNamespace = async () => {
    if (!namespaceToDelete) return
    const defaultNamespace = namespaces.find(n => n.isDefault)
    if (!defaultNamespace) {
      toast.error(t.namespace.selector.noDefault)
      return
    }
    setLoading(true)
    try {
      const snippetsToMove = await getSnippetsByNamespace(namespaceToDelete.id)
      if (snippetsToMove.length > 0) {
        await bulkMoveSnippets(
          snippetsToMove.map(s => s.id),
          defaultNamespace.id,
        )
      }
      await dispatch(deleteNamespace(namespaceToDelete.id)).unwrap()
      if (selectedNamespaceId === namespaceToDelete.id) {
        onNamespaceChange(defaultNamespace.id)
      }
      setDeleteDialogOpen(false)
      setNamespaceToDelete(null)
      const count = snippetsToMove.length
      toast.success(
        count > 0
          ? t.namespace.selector.deletedWithMoved.replace(
              '{count}',
              String(count),
            )
          : t.namespace.selector.deleted,
      )
    } catch (error) {
      console.error('Failed to delete namespace:', error)
      toast.error(t.namespace.selector.failedToDelete)
    } finally {
      setLoading(false)
    }
  }

  return {
    namespaces,
    newNamespaceName,
    createDialogOpen,
    deleteDialogOpen,
    namespaceToDelete,
    loading,
    ...rename,
    setNewNamespaceName,
    setCreateDialogOpen,
    setDeleteDialogOpen,
    setNamespaceToDelete,
    handleCreateNamespace,
    handleDeleteNamespace,
  }
}
