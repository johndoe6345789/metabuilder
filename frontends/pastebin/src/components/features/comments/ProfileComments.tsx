'use client'

import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectIsAuthenticated, selectProfileComments, selectCommentsLoading } from '@/store/selectors'
import { fetchProfileComments, addProfileComment } from '@/store/slices/commentsSlice'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import styles from './comments.module.scss'

interface ProfileCommentsProps {
  profileUserId: string
}

export function ProfileComments({ profileUserId }: ProfileCommentsProps) {
  const dispatch = useAppDispatch()
  const comments = useAppSelector(state => selectProfileComments(state, profileUserId))
  const loading = useAppSelector(selectCommentsLoading)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  useEffect(() => {
    dispatch(fetchProfileComments(profileUserId))
  }, [dispatch, profileUserId])

  async function handleSubmit(content: string) {
    await dispatch(addProfileComment({ profileUserId, content }))
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Comments</h2>
      <div className={styles.list}>
        {loading && comments.length === 0
          ? <p className={styles.empty}>Loading comments…</p>
          : comments.length === 0
            ? <p className={styles.empty}>No comments yet. Be the first!</p>
            : comments.map(c => <CommentItem key={c.id} comment={c} />)
        }
      </div>
      {isAuthenticated && <CommentForm onSubmit={handleSubmit} />}
    </section>
  )
}
