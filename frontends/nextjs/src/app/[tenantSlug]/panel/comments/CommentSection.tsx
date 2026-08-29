'use client'

import type { ReactNode } from 'react'
import { Paper, Typography } from '@/m3'
import type { Comment } from './comment-types'
import s from './page.module.scss'

export interface CommentSectionProps {
  title: string
  comments: Comment[]
  emptyMessage: string
  children: (comment: Comment) => ReactNode
}

/**
 * One titled group of comments. Both boards on this page are the same
 * shape -- a heading with a count, an empty note, and a list -- so they
 * share this and differ only in how a single row is drawn.
 */
export function CommentSection({
  title,
  comments,
  emptyMessage,
  children,
}: CommentSectionProps) {
  return (
    <Paper>
      <Typography variant="h6" gutterBottom>
        {title} ({comments.length})
      </Typography>
      {comments.length === 0 ? (
        <div className={s.empty}>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        </div>
      ) : (
        <div className={s.list}>{comments.map(children)}</div>
      )}
    </Paper>
  )
}
