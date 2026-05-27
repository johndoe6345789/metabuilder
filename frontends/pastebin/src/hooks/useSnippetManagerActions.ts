import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/store/hooks'
import { Snippet } from '@/lib/types'
import { toast } from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'
import { deleteSnippet } from '@/store/slices/snippetsSlice'
import { setSelectedNamespace } from '@/store/slices/namespacesSlice'
import { closeViewer, setSearchQuery } from '@/store/slices/uiSlice'
import { useSnippetSelectionActions } from './useSnippetSelectionActions'

export function useSnippetManagerActions() {
  const t = useTranslation()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const selection = useSnippetSelectionActions()

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
  }, [dispatch, t])

  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(t.toast.codeCopied)
  }, [t])

  const handleViewSnippet = useCallback((snippet: Snippet) => {
    router.push(`/snippet/${snippet.id}`)
  }, [router])

  const handleMoveSnippet = useCallback(() => {}, [])

  const handleCreateNew = useCallback(() => {
    router.push('/snippet/new')
  }, [router])

  const handleCreateFromTemplate = useCallback((templateId: string) => {
    router.push(
      `/snippet/new?template=${encodeURIComponent(templateId)}`
    )
  }, [router])

  const handleNamespaceChange = useCallback(
    (namespaceId: string | null) => {
      if (namespaceId) dispatch(setSelectedNamespace(namespaceId))
    },
    [dispatch],
  )

  const handleSearchChange = useCallback((query: string) => {
    dispatch(setSearchQuery(query))
  }, [dispatch])

  const handleViewerClose = useCallback((open: boolean) => {
    if (!open) dispatch(closeViewer())
  }, [dispatch])

  return {
    handleEditSnippet,
    handleDeleteSnippet,
    handleCopyCode,
    handleViewSnippet,
    handleMoveSnippet,
    handleCreateNew,
    handleCreateFromTemplate,
    handleNamespaceChange,
    handleSearchChange,
    handleViewerClose,
    ...selection,
  }
}
