'use client'

import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import { useProfileComments } from './hooks/useProfileComments'
import styles from './comments.module.scss'

interface ProfileCommentsProps {
  profileUserId: string
}

export function ProfileComments({ profileUserId }: ProfileCommentsProps) {
  const {
    comments, loading, isAuthenticated, handleSubmit,
  } = useProfileComments(profileUserId)

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Comments</h2>
      <div className={styles.list}>
        {loading && comments.length === 0
          ? <p className={styles.empty}>Loading comments…</p>
          : comments.length === 0
            ? <p className={styles.empty}>
                No comments yet. Be the first!
              </p>
            : comments.map(c => (
                <CommentItem key={c.id} comment={c} />
              ))
        }
      </div>
      {isAuthenticated && <CommentForm onSubmit={handleSubmit} />}
    </section>
  )
}
