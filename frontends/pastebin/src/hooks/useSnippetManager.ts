import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Snippet, SnippetTemplate } from '@/lib/types'
import { toast } from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'
import { syncTemplatesFromJSON } from '@/lib/db'
import {
  fetchSnippetsByNamespace,
  deleteSnippet,
  toggleSelectionMode,
  toggleSnippetSelection,
  selectAllSnippets as selectAllSnippetsAction,
  clearSelection,
  bulkMoveSnippets,
} from '@/store/slices/snippetsSlice'
import {
  fetchNamespaces,
  setSelectedNamespace,
} from '@/store/slices/namespacesSlice'
import {
  openViewer,
  closeViewer,
  setSearchQuery,
} from '@/store/slices/uiSlice'
import {
  selectFilteredSnippets,
  selectSnippetsLoading,
  selectSelectionMode,
  selectSelectedIds,
  selectNamespaces,
  selectSelectedNamespaceId,
  selectViewerOpen,
  selectViewingSnippet,
  selectSearchQuery,
  selectSnippets,
} from '@/store/selectors'

export function useSnippetManager(templates: SnippetTemplate[]) {
  const t = useTranslation()
  const dispatch = useAppDispatch()
  const router = useRouter()

  const snippets = useAppSelector(selectSnippets)
  const filteredSnippets = useAppSelector(selectFilteredSnippets)
  const loading = useAppSelector(selectSnippetsLoading)
  const selectionMode = useAppSelector(selectSelectionMode)
  const selectedIds = useAppSelector(selectSelectedIds)
  const namespaces = useAppSelector(selectNamespaces)
  const selectedNamespaceId = useAppSelector(selectSelectedNamespaceId)
  const viewerOpen = useAppSelector(selectViewerOpen)
  const viewingSnippet = useAppSelector(selectViewingSnippet)
  const searchQuery = useAppSelector(selectSearchQuery)

  useEffect(() => {
    const loadData = async () => {
      try {
        await syncTemplatesFromJSON(templates)
        await dispatch(fetchNamespaces()).unwrap()
      } catch (error) {
        console.error('Failed to load data:', error)
        toast.error(t.toast.failedToLoadData)
      }
    }

    loadData()
  }, [dispatch, templates])

  useEffect(() => {
    if (selectedNamespaceId) {
      dispatch(fetchSnippetsByNamespace(selectedNamespaceId))
    }
  }, [dispatch, selectedNamespaceId])

  const handleEditSnippet = useCallback((snippet: Snippet) => {
    router.push(`/snippet/${snippet.id}`)
  }, [router])

  const handleDeleteSnippet = useCallback(async (id: string) => {
    try {
      await dispatch(deleteSnippet(id)).unwrap()
      toast.success(t.toast.snippetDeleted)
    } catch (error) {
      console.error('Failed to delete snippet:', error)
      toast.error(t.toast.failedToDeleteSnippet)
    }
  }, [dispatch])

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(t.toast.codeCopied)
  }, [])

  const handleViewSnippet = useCallback((snippet: Snippet) => {
    router.push(`/snippet/${snippet.id}`)
  }, [router])

  const handleMoveSnippet = useCallback(() => {
    // SnippetCard dispatches moveSnippet internally via Redux; this is a post-move hook
  }, [])

  const handleCreateNew = useCallback(() => {
    router.push('/snippet/new')
  }, [router])

  const handleCreateFromTemplate = useCallback((templateId: string) => {
    router.push(`/snippet/new?template=${encodeURIComponent(templateId)}`)
  }, [router])

  const handleToggleSelectionMode = useCallback(() => {
    dispatch(toggleSelectionMode())
  }, [dispatch])

  const handleToggleSnippetSelection = useCallback((snippetId: string) => {
    dispatch(toggleSnippetSelection(snippetId))
  }, [dispatch])

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredSnippets.length) {
      dispatch(clearSelection())
    } else {
      dispatch(selectAllSnippetsAction())
    }
  }, [dispatch, filteredSnippets.length, selectedIds.length])

  const handleBulkMove = useCallback(async (targetNamespaceId: string) => {
    if (selectedIds.length === 0) {
      toast.error(t.toast.noSnippetsSelected)
      return
    }

    try {
      await dispatch(bulkMoveSnippets({
        snippetIds: Array.from(selectedIds),
        targetNamespaceId
      })).unwrap()
      
      const targetNamespace = namespaces.find(n => n.id === targetNamespaceId)
      toast.success(t.toast.movedSnippets.replace('{count}', String(selectedIds.length)).replace('{namespace}', targetNamespace?.name || 'namespace'))
      
      if (selectedNamespaceId) {
        dispatch(fetchSnippetsByNamespace(selectedNamespaceId))
      }
    } catch (error) {
      console.error('Failed to bulk move snippets:', error)
      toast.error(t.toast.failedToMoveSnippets)
    }
  }, [dispatch, selectedIds, namespaces, selectedNamespaceId])

  const handleNamespaceChange = useCallback((namespaceId: string | null) => {
    if (namespaceId) {
      dispatch(setSelectedNamespace(namespaceId))
    }
  }, [dispatch])

  const handleSearchChange = useCallback((query: string) => {
    dispatch(setSearchQuery(query))
  }, [dispatch])

  const handleViewerClose = useCallback((open: boolean) => {
    if (!open) {
      dispatch(closeViewer())
    }
  }, [dispatch])

  return {
    snippets,
    filteredSnippets,
    loading,
    selectionMode,
    selectedIds,
    namespaces,
    selectedNamespaceId,
    viewerOpen,
    viewingSnippet,
    searchQuery,
    handleEditSnippet,
    handleDeleteSnippet,
    handleCopyCode,
    handleViewSnippet,
    handleMoveSnippet,
    handleCreateNew,
    handleCreateFromTemplate,
    handleToggleSelectionMode,
    handleToggleSnippetSelection,
    handleSelectAll,
    handleBulkMove,
    handleNamespaceChange,
    handleSearchChange,
    handleViewerClose,
  }
}
