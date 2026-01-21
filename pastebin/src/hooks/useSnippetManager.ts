import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Snippet, SnippetTemplate } from '@/lib/types'
import { toast } from 'sonner'
import { strings } from '@/lib/config'
import { seedDatabase, syncTemplatesFromJSON } from '@/lib/db'
import {
  fetchSnippetsByNamespace,
  createSnippet,
  updateSnippet,
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
  openDialog,
  closeDialog,
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
  selectDialogOpen,
  selectViewerOpen,
  selectEditingSnippet,
  selectViewingSnippet,
  selectSearchQuery,
  selectSnippets,
} from '@/store/selectors'

export function useSnippetManager(templates: SnippetTemplate[]) {
  const dispatch = useAppDispatch()
  
  const snippets = useAppSelector(selectSnippets)
  const filteredSnippets = useAppSelector(selectFilteredSnippets)
  const loading = useAppSelector(selectSnippetsLoading)
  const selectionMode = useAppSelector(selectSelectionMode)
  const selectedIds = useAppSelector(selectSelectedIds)
  const namespaces = useAppSelector(selectNamespaces)
  const selectedNamespaceId = useAppSelector(selectSelectedNamespaceId)
  const dialogOpen = useAppSelector(selectDialogOpen)
  const viewerOpen = useAppSelector(selectViewerOpen)
  const editingSnippet = useAppSelector(selectEditingSnippet)
  const viewingSnippet = useAppSelector(selectViewingSnippet)
  const searchQuery = useAppSelector(selectSearchQuery)

  useEffect(() => {
    const loadData = async () => {
      try {
        await seedDatabase()
        await syncTemplatesFromJSON(templates)
        await dispatch(fetchNamespaces()).unwrap()
      } catch (error) {
        console.error('Failed to load data:', error)
        toast.error('Failed to load data')
      }
    }

    loadData()
  }, [dispatch, templates])

  useEffect(() => {
    if (selectedNamespaceId) {
      dispatch(fetchSnippetsByNamespace(selectedNamespaceId))
    }
  }, [dispatch, selectedNamespaceId])

  const handleSaveSnippet = useCallback(async (snippetData: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingSnippet?.id) {
        await dispatch(updateSnippet({ ...editingSnippet, ...snippetData })).unwrap()
        toast.success(strings.toast.snippetUpdated)
      } else {
        await dispatch(createSnippet({
          ...snippetData,
          namespaceId: selectedNamespaceId || undefined,
        })).unwrap()
        toast.success(strings.toast.snippetCreated)
      }
      dispatch(closeDialog())
    } catch (error) {
      console.error('Failed to save snippet:', error)
      toast.error('Failed to save snippet')
    }
  }, [dispatch, editingSnippet, selectedNamespaceId])

  const handleEditSnippet = useCallback((snippet: Snippet) => {
    dispatch(openDialog(snippet))
  }, [dispatch])

  const handleDeleteSnippet = useCallback(async (id: string) => {
    try {
      await dispatch(deleteSnippet(id)).unwrap()
      toast.success(strings.toast.snippetDeleted)
    } catch (error) {
      console.error('Failed to delete snippet:', error)
      toast.error('Failed to delete snippet')
    }
  }, [dispatch])

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(strings.toast.codeCopied)
  }, [])

  const handleViewSnippet = useCallback((snippet: Snippet) => {
    dispatch(openViewer(snippet))
  }, [dispatch])

  const handleMoveSnippet = useCallback(async () => {
    if (selectedNamespaceId) {
      dispatch(fetchSnippetsByNamespace(selectedNamespaceId))
    }
  }, [dispatch, selectedNamespaceId])

  const handleCreateNew = useCallback(() => {
    dispatch(openDialog(null))
  }, [dispatch])

  const handleCreateFromTemplate = useCallback((templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return

    const templateSnippet = {
      id: '',
      title: template.title,
      description: template.description,
      language: template.language,
      code: template.code,
      category: template.category,
      hasPreview: template.hasPreview,
      functionName: template.functionName,
      inputParameters: template.inputParameters,
      createdAt: 0,
      updatedAt: 0,
    } as Snippet
    
    dispatch(openDialog(templateSnippet))
  }, [dispatch, templates])

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
      toast.error('No snippets selected')
      return
    }

    try {
      await dispatch(bulkMoveSnippets({
        snippetIds: Array.from(selectedIds),
        targetNamespaceId
      })).unwrap()
      
      const targetNamespace = namespaces.find(n => n.id === targetNamespaceId)
      toast.success(`Moved ${selectedIds.length} snippet${selectedIds.length > 1 ? 's' : ''} to ${targetNamespace?.name || 'namespace'}`)
      
      if (selectedNamespaceId) {
        dispatch(fetchSnippetsByNamespace(selectedNamespaceId))
      }
    } catch (error) {
      console.error('Failed to bulk move snippets:', error)
      toast.error('Failed to move snippets')
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

  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      dispatch(closeDialog())
    }
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
    dialogOpen,
    viewerOpen,
    editingSnippet,
    viewingSnippet,
    searchQuery,
    handleSaveSnippet,
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
    handleDialogClose,
    handleViewerClose,
  }
}
