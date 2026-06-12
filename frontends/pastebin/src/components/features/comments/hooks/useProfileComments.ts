import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
  selectProfileComments,
  selectCommentsLoading,
  selectIsAuthenticated,
} from '@/store/selectors'
import {
  fetchProfileComments,
  addProfileComment,
} from '@/store/slices/commentsSlice'

export function useProfileComments(profileUserId: string) {
  const dispatch = useAppDispatch()
  const comments = useAppSelector(state =>
    selectProfileComments(state, profileUserId),
  )
  const loading = useAppSelector(selectCommentsLoading)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  useEffect(() => {
    dispatch(fetchProfileComments(profileUserId))
  }, [dispatch, profileUserId])

  async function handleSubmit(content: string) {
    await dispatch(addProfileComment({ profileUserId, content }))
  }

  return { comments, loading, isAuthenticated, handleSubmit }
}
