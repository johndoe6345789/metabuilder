import { useEffect } from 'react'
import { toast } from '@metabuilder/components/m3'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { patchSnippetLocal } from '@/store/slices/snippetsSlice'
import { fetchRevisions, revertToRevision } from '@/store/slices/revisionsSlice'
import { selectRevisions, selectRevisionsLoading } from '@/store/selectors'

export function useHistoryPanel(open: boolean, snippetId: string) {
  const dispatch = useAppDispatch()
  const revisions = useAppSelector(state => selectRevisions(state, snippetId))
  const loading = useAppSelector(selectRevisionsLoading)

  useEffect(() => {
    if (!open) return
    dispatch(fetchRevisions(snippetId))
  }, [open, snippetId, dispatch])

  async function handleRevert(revisionId: string) {
    try {
      const updated = await dispatch(
        revertToRevision({ snippetId, revisionId }),
      ).unwrap()
      dispatch(
        patchSnippetLocal({
          id: snippetId,
          fields: { code: updated.code, files: updated.files },
        }),
      )
      toast.success('Reverted successfully')
      dispatch(fetchRevisions(snippetId))
    } catch {
      toast.error('Failed to revert — please try again')
    }
  }

  return { revisions, loading, handleRevert }
}
