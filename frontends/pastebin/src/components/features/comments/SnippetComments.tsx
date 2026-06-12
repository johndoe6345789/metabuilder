'use client'

import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import { useSnippetComments } from './hooks/useSnippetComments'
import styles from './comments.module.scss'

interface SnippetCommentsProps {
  snippetId: string
}

export function SnippetComments({ snippetId }: SnippetCommentsProps) {
  const { comments, loading, isAuthenticated, handleSubmit } =
    useSnippetComments(snippetId)

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Comments</h2>
      <div className={styles.list}>
        {loading && comments.length === 0 ? (
          <p className={styles.empty}>Loading comments…</p>
        ) : comments.length === 0 ? (
          <p className={styles.empty}>No comments yet.</p>
        ) : (
          comments.map(c => <CommentItem key={c.id} comment={c} />)
        )}
      </div>
      {isAuthenticated && (
        <CommentForm
          onSubmit={handleSubmit}
          placeholder="Comment on this snippet… (markdown supported)"
        />
      )}
    </section>
  )
}
