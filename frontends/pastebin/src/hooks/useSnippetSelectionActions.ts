import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toast } from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'
import {
  toggleSelectionMode,
  toggleSnippetSelection,
  selectAllSnippets as selectAllSnippetsAction,
  clearSelection,
  bulkMoveSnippets,
  fetchSnippetsByNamespace,
} from '@/store/slices/snippetsSlice'
import {
  selectFilteredSnippets,
  selectSelectedIds,
  selectNamespaces,
  selectSelectedNamespaceId,
} from '@/store/selectors'

export function useSnippetSelectionActions() {
  const t = useTranslation()
  const dispatch = useAppDispatch()
  const filteredSnippets = useAppSelector(selectFilteredSnippets)
  const selectedIds = useAppSelector(selectSelectedIds)
  const namespaces = useAppSelector(selectNamespaces)
  const selectedNamespaceId = useAppSelector(selectSelectedNamespaceId)

  const handleToggleSelectionMode = useCallback(() => {
    dispatch(toggleSelectionMode())
  }, [dispatch])

  const handleToggleSnippetSelection = useCallback(
    (snippetId: string) => { dispatch(toggleSnippetSelection(snippetId)) },
    [dispatch],
  )

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredSnippets.length) {
      dispatch(clearSelection())
    } else {
      dispatch(selectAllSnippetsAction())
    }
  }, [dispatch, filteredSnippets.length, selectedIds.length])

  const handleBulkMove = useCallback(
    async (targetNamespaceId: string) => {
      if (selectedIds.length === 0) {
        toast.error(t.toast.noSnippetsSelected)
        return
      }
      try {
        await dispatch(bulkMoveSnippets({
          snippetIds: Array.from(selectedIds),
          targetNamespaceId,
        })).unwrap()
        const target = namespaces.find(n => n.id === targetNamespaceId)
        toast.success(
          t.toast.movedSnippets
            .replace('{count}', String(selectedIds.length))
            .replace('{namespace}', target?.name || 'namespace'),
        )
        if (selectedNamespaceId) {
          dispatch(fetchSnippetsByNamespace(selectedNamespaceId))
        }
      } catch (error) {
        console.error('Failed to bulk move snippets:', error)
        toast.error(t.toast.failedToMoveSnippets)
      }
    },
    [dispatch, selectedIds, namespaces, selectedNamespaceId, t],
  )

  return {
    handleToggleSelectionMode,
    handleToggleSnippetSelection,
    handleSelectAll,
    handleBulkMove,
  }
}
