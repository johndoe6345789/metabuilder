'use client'

import { MarkdownRenderer } from '@/components/error/MarkdownRenderer'
import { useCommentForm } from './hooks/useCommentForm'
import styles from './comments.module.scss'

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>
  placeholder?: string
}

export function CommentForm({
  onSubmit,
  placeholder = 'Leave a comment… (markdown supported)',
}: CommentFormProps) {
  const { content, preview, submitting, setContent, setPreview, handleSubmit } =
    useCommentForm(onSubmit)

  return (
    <div className={styles.form}>
      <div className={styles.formTabs}>
        <button
          className={`${styles.tabBtn} ${!preview ? styles.tabActive : ''}`}
          onClick={() => setPreview(false)}
          type="button"
        >
          Write
        </button>
        <button
          className={`${styles.tabBtn} ${preview ? styles.tabActive : ''}`}
          onClick={() => setPreview(true)}
          type="button"
        >
          Preview
        </button>
      </div>

      {preview ? (
        <div className={styles.preview}>
          {content.trim() ? (
            <MarkdownRenderer content={content} animate={false} />
          ) : (
            <span
              style={{
                color: 'var(--mat-sys-on-surface-variant)',
                fontSize: '0.875rem',
              }}
            >
              Nothing to preview
            </span>
          )}
        </div>
      ) : (
        <textarea
          className={styles.textarea}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={placeholder}
          aria-label="Comment text"
        />
      )}

      <div className={styles.formRow}>
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
          type="button"
        >
          {submitting ? 'Posting…' : 'Post Comment'}
        </button>
      </div>
    </div>
  )
}
