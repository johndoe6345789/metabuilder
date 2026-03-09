import type { Comment } from '@/lib/types'
import { UserAvatar } from '@/components/layout/UserAvatar'
import { MarkdownRenderer } from '@/components/error/MarkdownRenderer'
import styles from './comments.module.scss'

function relativeTime(ms: number): string {
  const diff = Date.now() - ms
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(ms).toLocaleDateString()
}

interface CommentItemProps {
  comment: Comment
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className={styles.item}>
      <UserAvatar username={comment.authorUsername} size="sm" />
      <div className={styles.itemBody}>
        <div className={styles.itemMeta}>
          <span className={styles.itemAuthor}>{comment.authorUsername}</span>
          <span className={styles.itemTime}>{relativeTime(comment.createdAt)}</span>
        </div>
        <MarkdownRenderer content={comment.content} animate={false} />
      </div>
    </div>
  )
}
