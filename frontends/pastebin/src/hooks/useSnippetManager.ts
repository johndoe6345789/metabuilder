import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { SnippetTemplate } from '@/lib/types'
import { toast } from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'
import { syncTemplatesFromJSON } from '@/lib/db'
import { fetchSnippetsByNamespace } from '@/store/slices/snippetsSlice'
import { fetchNamespaces } from '@/store/slices/namespacesSlice'
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
import { useSnippetManagerActions } from './useSnippetManagerActions'

export function useSnippetManager(templates: SnippetTemplate[]) {
  const t = useTranslation()
  const dispatch = useAppDispatch()

  const isAuthenticated = useAppSelector(
    (s: any) => s.auth?.isAuthenticated ?? false,
  )
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

  const actions = useSnippetManagerActions()

  useEffect(() => {
    if (!isAuthenticated) return
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
  }, [dispatch, templates, isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedNamespaceId) {
      dispatch(fetchSnippetsByNamespace(selectedNamespaceId))
    }
  }, [dispatch, selectedNamespaceId])

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
    ...actions,
  }
}
