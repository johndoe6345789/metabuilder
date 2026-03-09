'use client'

import { useEffect } from 'react'
import { toast } from '@metabuilder/components/fakemui'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectIsAuthenticated, selectSnippetComments, selectCommentsLoading } from '@/store/selectors'
import { fetchSnippetComments, addSnippetComment } from '@/store/slices/commentsSlice'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import styles from './comments.module.scss'

interface SnippetCommentsProps {
  snippetId: string
}

export function SnippetComments({ snippetId }: SnippetCommentsProps) {
  const dispatch = useAppDispatch()
  const comments = useAppSelector(state => selectSnippetComments(state, snippetId))
  const loading = useAppSelector(selectCommentsLoading)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  useEffect(() => {
    dispatch(fetchSnippetComments(snippetId))
  }, [dispatch, snippetId])

  async function handleSubmit(content: string) {
    try {
      await dispatch(addSnippetComment({ snippetId, content })).unwrap()
    } catch {
      toast.error('Failed to post comment')
    }
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Comments</h2>
      <div className={styles.list}>
        {loading && comments.length === 0
          ? <p className={styles.empty}>Loading comments…</p>
          : comments.length === 0
            ? <p className={styles.empty}>No comments yet.</p>
            : comments.map(c => <CommentItem key={c.id} comment={c} />)
        }
      </div>
      {isAuthenticated && (
        <CommentForm onSubmit={handleSubmit} placeholder="Comment on this snippet… (markdown supported)" />
      )}
    </section>
  )
}
